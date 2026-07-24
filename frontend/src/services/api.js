import axios from 'axios';

// ─── Data version: bump this to wipe stale localStorage on next load ───
const DATA_VERSION = '3';

// Only the system admin is seeded. All other users must register.
const defaultUsers = [
  { id: 1, username: 'admin', email: 'admin@workforcehub.com', firstName: 'Admin', lastName: 'User', role: 'ROLE_ADMIN', department: 'Management', password: 'admin123' },
];

// No pre-seeded employees, projects, tasks, or audit logs.
const defaultEmployees = [];
const defaultProjects   = [];
const defaultTasks      = [];
const defaultAuditLogs  = [];

const getStorage = (key, defaultVal) => {
  const item = localStorage.getItem(`wh_${key}`);
  if (!item) {
    localStorage.setItem(`wh_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultVal;
  }
};

const setStorage = (key, val) => {
  localStorage.setItem(`wh_${key}`, JSON.stringify(val));
};

// ── One-time localStorage wipe when DATA_VERSION changes ──────────────────
// This clears stale old data (default users/employees/projects/tasks) so
// the app always starts fresh with only the admin account.
(function migrateDataVersion() {
  const stored = localStorage.getItem('wh_data_version');
  if (stored !== DATA_VERSION) {
    const keysToWipe = ['wh_users', 'wh_employees', 'wh_projects', 'wh_tasks', 'wh_audit_logs',
                        'wh_data_version', 'workforce_user', 'workforce_jwt_token', 'token'];
    keysToWipe.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('wh_data_version', DATA_VERSION);
  }
})();


// ── Recalculate and persist project progress/status from its current tasks ──
// Hoisted above handleMockRequest so it can be called from POST /projects and POST/PUT/DELETE /tasks
// Progress = (done tasks / total tasks in project) × 100
const syncProjectFromTasks = (pId) => {
  if (!pId) return;
  const allTasks    = getStorage('tasks', defaultTasks);
  const allProjects = getStorage('projects', defaultProjects);

  const pIndex = allProjects.findIndex(p => Number(p.id) === Number(pId));
  if (pIndex === -1) return;

  const projectTasks = allTasks.filter(t => Number(t.projectId) === Number(pId));
  const total        = projectTasks.length;
  const done         = projectTasks.filter(t => {
    const s = String(t.status || '').toUpperCase();
    return s === 'DONE' || s === 'COMPLETED';
  }).length;

  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  let status = progress === 100 ? 'Completed' : progress === 0 ? 'Not Started' : 'In Progress';

  allProjects[pIndex] = {
    ...allProjects[pIndex],
    progress,
    status,
    totalTasks:     total,
    completedTasks: done,
    pendingTasks:   total - done,
  };
  setStorage('projects', allProjects);
};

const handleMockRequest = (method, url, data) => {
  // Always re-read from storage on every request to avoid stale closures
  const users      = getStorage('users', defaultUsers);
  const employees  = getStorage('employees', defaultEmployees);
  const projects   = getStorage('projects', defaultProjects);
  const tasks      = getStorage('tasks', defaultTasks);
  const auditLogs  = getStorage('audit_logs', defaultAuditLogs);

  // Normalize URL
  const cleanUrl = url.split('?')[0];

  if (method === 'post' && cleanUrl === '/auth/login') {
    const { username, password } = data;
    // Match by username OR by email (support alice@gmail.com as username input)
    const found = users.find(
      u => u.username === username || u.email === username
    );
    if (!found) {
      return { status: 401, data: { message: 'Invalid username or password' } };
    }

    // admin always uses admin123; everyone else uses the password stored at registration
    const isAdminAccount = found.username === 'admin' || found.email === 'admin@workforcehub.com';
    const expectedPassword = isAdminAccount ? 'admin123' : found.password;

    if (!expectedPassword || password !== expectedPassword) {
      return { status: 401, data: { message: 'Invalid username or password' } };
    }
    const token = 'mock-jwt-token-' + Date.now();
    return { status: 200, data: { token, refreshToken: token, user: found, message: 'Login successful' } };
  }

  if (method === 'post' && cleanUrl === '/auth/register') {
    const newUser = {
      id: users.length + 1,
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName || 'New',
      lastName: data.lastName || 'User',
      role: data.role || 'ROLE_EMPLOYEE',
      department: data.department || 'General'
    };
    users.push(newUser);
    setStorage('users', users);

    const maxCodeNum = employees.reduce((max, e) => {
      const num = parseInt((e.code || '').replace('EMP-', '')) || 0;
      return num > max ? num : max;
    }, 1000);

    const newEmp = {
      id: Date.now(),
      code: `EMP-${maxCodeNum + 1}`,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: '+91 98765 00000',
      department: newUser.department,
      jobTitle: 'Associate',
      accountRole: newUser.role,
      salary: 900000,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      officeLocation: 'Bengaluru, Karnataka'
    };
    employees.push(newEmp);
    setStorage('employees', employees);

    const token = 'mock-jwt-token-' + Date.now();
    return { status: 201, data: { token, refreshToken: token, user: newUser, message: 'Registered successfully' } };
  }

  if (method === 'get' && cleanUrl === '/auth/me') {
    const saved = localStorage.getItem('workforce_user');
    const user = saved ? JSON.parse(saved) : users[0];
    return { status: 200, data: { user } };
  }

  if (method === 'get' && cleanUrl === '/profile') {
    const saved = localStorage.getItem('workforce_user');
    const currentUser = saved ? JSON.parse(saved) : users[0];
    return { status: 200, data: currentUser };
  }

  if (method === 'post' && cleanUrl === '/profile/upload-image') {
    const saved = localStorage.getItem('workforce_user');
    let currentUser = saved ? JSON.parse(saved) : users[0];
    const imageUrl = data?.profileImageUrl || (typeof data === 'string' ? data : null);
    if (imageUrl) {
      currentUser = { ...currentUser, profileImageUrl: imageUrl };
      localStorage.setItem('workforce_user', JSON.stringify(currentUser));
      const uIdx = users.findIndex(u => u.id === currentUser.id || u.username === currentUser.username);
      if (uIdx !== -1) {
        users[uIdx].profileImageUrl = imageUrl;
        setStorage('users', users);
      }
    }
    return { status: 200, data: currentUser };
  }

  if (method === 'get' && cleanUrl === '/dashboard/stats') {
    const totalEmployees = employees.length;
    const activeProjectsList = projects.filter(p => p.status === 'IN_PROGRESS');
    const activeProjectsCount = activeProjectsList.length;
    const totalProjectsCount = projects.length;

    // Helper to check if a task is done
    const isTaskDone = (t) => {
      const s = String(t.status || '').toUpperCase();
      return s === 'DONE' || s === 'COMPLETED';
    };

    const pendingTasksList = tasks.filter(t => !isTaskDone(t));
    const pendingTasksCount = pendingTasksList.length;
    const completedTasksCount = tasks.filter(t => isTaskDone(t)).length;
    const totalTasksCount = tasks.length;
    const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    const urgentTasksCount = tasks.filter(t => String(t.priority).toUpperCase() === 'URGENT' && !isTaskDone(t)).length;

    // Calculate department breakdown
    const deptMap = {};
    employees.forEach(e => {
      const d = e.department || 'General';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const departmentBreakdown = Object.entries(deptMap).map(([name, count]) => {
      const percentage = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
      return { name, count, percentage };
    });

    const recentActivities = auditLogs.slice(-5).reverse();

    return {
      status: 200,
      data: {
        totalEmployees,
        totalWorkforce: totalEmployees,
        activeProjects: activeProjectsCount,
        totalProjects: totalProjectsCount,
        pendingTasks: pendingTasksCount,
        urgentTasks: urgentTasksCount,
        taskCompletionRate,
        completedTasksCount,
        totalTasksCount,
        activeProjectsList,
        activeProjectsOverview: activeProjectsList,
        departmentBreakdown,
        recentActivities,
        pendingLeaves: 3,
        attendanceRate: 94.8,
        departmentCount: Object.keys(deptMap).length,
      }
    };
  }

  if (method === 'get' && cleanUrl === '/employees') {
    let result = [...employees];
    const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const search = params.get('search')?.toLowerCase();
    const department = params.get('department');
    const status = params.get('status');
    const role = params.get('role');
    const sortBy = params.get('sortBy');
    const sortOrder = params.get('sortOrder') || 'ASC';

    if (search) {
      result = result.filter(e => 
        (e.firstName && e.firstName.toLowerCase().includes(search)) ||
        (e.lastName && e.lastName.toLowerCase().includes(search)) ||
        (e.code && e.code.toLowerCase().includes(search)) ||
        (e.email && e.email.toLowerCase().includes(search)) ||
        (e.department && e.department.toLowerCase().includes(search)) ||
        (e.jobTitle && e.jobTitle.toLowerCase().includes(search))
      );
    }
    if (department && department !== 'All') {
      result = result.filter(e => e.department && e.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'All') {
      result = result.filter(e => e.status && e.status.toUpperCase() === status.toUpperCase());
    }
    if (role && role !== 'All') {
      result = result.filter(e => e.accountRole === role);
    }

    if (sortBy) {
      result.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (sortBy === 'code') {
          valA = parseInt(String(valA).replace('EMP-', '')) || 0;
          valB = parseInt(String(valB).replace('EMP-', '')) || 0;
        } else {
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
        }
        if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
        if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    result = result.map(e => ({
      id: e.id,
      code: e.code || `EMP-${e.id}`,
      firstName: e.firstName || 'Employee',
      lastName: e.lastName || '',
      email: e.email || 'employee@workforcehub.com',
      phone: e.phone || '+91 98765 00000',
      department: e.department || 'Engineering',
      jobTitle: e.jobTitle || 'Specialist',
      accountRole: e.accountRole || 'ROLE_EMPLOYEE',
      salary: e.salary !== undefined && e.salary !== null ? Number(e.salary) : 1200000,
      joinDate: e.joinDate || '2024-01-01',
      status: e.status || 'ACTIVE',
      officeLocation: e.officeLocation || 'Bengaluru, Karnataka',
      skills: e.skills || 'Full Stack Development'
    }));

    return { status: 200, data: result };
  }
  if (method === 'post' && cleanUrl === '/employees') {
    const maxCodeNum = employees.reduce((max, e) => {
      const num = parseInt((e.code || '').replace('EMP-', '')) || 0;
      return num > max ? num : max;
    }, 1000);
    const dept = (data?.department === 'Others' && data?.customDepartment) ? data.customDepartment : (data?.department || 'Engineering');
    const newEmp = { 
      id: Date.now(), 
      code: `EMP-${maxCodeNum + 1}`,
      firstName: data?.firstName || 'New',
      lastName: data?.lastName || 'Employee',
      email: data?.email || 'employee@workforcehub.com',
      phone: data?.phone || '+91 98765 00000',
      department: dept,
      jobTitle: data?.jobTitle || 'Specialist',
      accountRole: data?.accountRole || 'ROLE_EMPLOYEE',
      salary: data?.salary !== undefined && data?.salary !== '' ? Number(data.salary) : 1200000,
      status: data?.status || 'ACTIVE',
      officeLocation: data?.officeLocation || 'Bengaluru, Karnataka',
      skills: data?.skills || 'Full Stack Development',
      joinDate: new Date().toISOString().split('T')[0]
    };
    employees.push(newEmp);
    setStorage('employees', employees);
    return { status: 201, data: newEmp };
  }
  if (method === 'put' && cleanUrl.startsWith('/employees/')) {
    const id = parseInt(cleanUrl.split('/')[2]);
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      const existing = employees[index];
      employees[index] = { 
        ...existing, 
        ...(data || {}),
        firstName: data?.firstName || existing.firstName || 'Employee',
        lastName: data?.lastName || existing.lastName || '',
        email: data?.email || existing.email || '',
        phone: data?.phone || existing.phone || '+91 98765 00000',
        department: data?.department || existing.department || 'Engineering',
        jobTitle: data?.jobTitle || existing.jobTitle || 'Specialist',
        accountRole: data?.accountRole || existing.accountRole || 'ROLE_EMPLOYEE',
        salary: data?.salary !== undefined && data?.salary !== '' ? Number(data.salary) : (existing.salary || 1200000),
        status: data?.status || existing.status || 'ACTIVE',
        officeLocation: data?.officeLocation || existing.officeLocation || 'Bengaluru, Karnataka',
        skills: data?.skills || existing.skills || 'Full Stack Development'
      };
      setStorage('employees', employees);
      return { status: 200, data: employees[index] };
    }
  }
  if (method === 'delete' && cleanUrl.startsWith('/employees/')) {
    const id = parseInt(cleanUrl.split('/')[2]);
    const filtered = employees.filter(e => e.id !== id);
    setStorage('employees', filtered);
    return { status: 200, data: { message: 'Deleted successfully' } };
  }

  if (method === 'get' && cleanUrl === '/projects') {
    let result = [...projects];
    const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const search = params.get('search')?.toLowerCase();
    const department = params.get('department');
    const status = params.get('status');
    const priority = params.get('priority');
    const sortBy = params.get('sortBy');
    const sortOrder = params.get('sortOrder') || 'ASC';

    if (search) {
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.code && p.code.toLowerCase().includes(search)) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.department && p.department.toLowerCase().includes(search))
      );
    }
    if (department && department !== 'All') {
      result = result.filter(p => p.department && p.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'All') {
      result = result.filter(p => p.status && p.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && priority !== 'All') {
      result = result.filter(p => p.priority && p.priority.toUpperCase() === priority.toUpperCase());
    }

    if (sortBy) {
      result.sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
        if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    return { status: 200, data: result };
  }

  if (method === 'post' && cleanUrl === '/projects') {
    const maxCodeNum = projects.reduce((max, p) => {
      const num = parseInt((p.code || '').replace(/[^0-9]/g, '')) || 0;
      return num > max ? num : max;
    }, 100);
    const maxPrjId = projects.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
    const newPrj = {
      id: maxPrjId + 1,
      code: `PRJ-${maxCodeNum + 1}`,
      name: data?.name || 'New Project',
      description: data?.description || '',
      department: data?.department || 'Engineering',
      priority: data?.priority || 'HIGH',
      status: data?.status || 'In Progress',
      progress: 0,
      budget: data?.budget !== undefined && data?.budget !== '' ? Number(data.budget) : 200000,
      startDate: data?.startDate || new Date().toISOString().split('T')[0],
      deadline: data?.deadline || '2026-12-31',
      assignedEmployeeIds: Array.isArray(data?.assignedEmployeeIds) ? data.assignedEmployeeIds : [],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0
    };
    projects.push(newPrj);
    setStorage('projects', projects);

    // Create initial tasks if specified during project creation
    if (Array.isArray(data?.initialTasks) && data.initialTasks.length > 0) {
      data.initialTasks.forEach((t, idx) => {
        if (t.title && t.title.trim()) {
          const maxTaskNum = tasks.reduce((max, taskItem) => {
            const num = parseInt((taskItem.taskNumber || '').replace('TSK-', '')) || 0;
            return num > max ? num : max;
          }, 1000);

          const empId = t.assignedEmployeeId ? Number(t.assignedEmployeeId) : (newPrj.assignedEmployeeIds[0] || null);
          const emp = empId ? employees.find(e => Number(e.id) === Number(empId)) : null;

          tasks.push({
            id: Date.now() + idx + 1,
            taskNumber: `TSK-${maxTaskNum + 1 + idx}`,
            title: t.title.trim(),
            description: t.description || `Task deliverable for project: ${newPrj.name}`,
            projectId: newPrj.id,
            projectName: newPrj.name,
            assignedEmployeeId: empId,
            assignedEmployeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
            employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
            priority: t.priority || 'HIGH',
            status: 'TODO',
            progress: 0,
            dueDate: newPrj.deadline || '2026-12-31',
            remarks: 'Initial project deliverable'
          });
        }
      });
      setStorage('tasks', tasks);
      syncProjectFromTasks(newPrj.id);
    }

    return { status: 201, data: newPrj };
  }

  if (method === 'put' && cleanUrl.startsWith('/projects/')) {
    const id = parseInt(cleanUrl.split('/')[2]);
    const index = projects.findIndex(p => Number(p.id) === Number(id));
    if (index !== -1) {
      const existing = projects[index];
      projects[index] = {
        ...existing,
        ...(data || {}),
        name: data?.name || existing.name,
        description: data?.description !== undefined ? data.description : existing.description,
        department: data?.department || existing.department,
        priority: data?.priority || existing.priority,
        status: data?.status || existing.status,
        budget: data?.budget !== undefined && data?.budget !== '' ? Number(data.budget) : existing.budget,
        startDate: data?.startDate || existing.startDate,
        deadline: data?.deadline || existing.deadline,
        assignedEmployeeIds: Array.isArray(data?.assignedEmployeeIds) ? data.assignedEmployeeIds : (existing.assignedEmployeeIds || [])
      };
      setStorage('projects', projects);
      return { status: 200, data: projects[index] };
    }
  }

  if (method === 'delete' && cleanUrl.startsWith('/projects/')) {
    const id = parseInt(cleanUrl.split('/')[2]);
    const filtered = projects.filter(p => Number(p.id) !== Number(id));
    setStorage('projects', filtered);
    return { status: 200, data: { message: 'Deleted successfully' } };
  }


  // syncProjectFromTasks is now defined at module scope above handleMockRequest — no-op placeholder
  // kept for reference; actual function is hoisted above

  // ── GET /tasks ───────────────────────────────────────────────────────────────
  if (method === 'get' && cleanUrl === '/tasks') {
    let result = [...tasks];
    const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const search = params.get('search')?.toLowerCase();
    const prjIdParam = params.get('projectId');
    const empIdParam = params.get('assignedEmployeeId');
    const statusParam = params.get('status');
    const priorityParam = params.get('priority');

    if (search) {
      result = result.filter(t =>
        (t.title && t.title.toLowerCase().includes(search)) ||
        (t.description && t.description.toLowerCase().includes(search)) ||
        (t.taskNumber && t.taskNumber.toLowerCase().includes(search)) ||
        (t.remarks && t.remarks.toLowerCase().includes(search))
      );
    }
    if (prjIdParam && prjIdParam !== 'All') {
      result = result.filter(t => Number(t.projectId) === Number(prjIdParam));
    }
    if (empIdParam && empIdParam !== 'All') {
      result = result.filter(t => Number(t.assignedEmployeeId) === Number(empIdParam));
    }
    if (statusParam && statusParam !== 'All') {
      result = result.filter(t => String(t.status || '').toUpperCase() === statusParam.toUpperCase());
    }
    if (priorityParam && priorityParam !== 'All') {
      result = result.filter(t => String(t.priority || '').toUpperCase() === priorityParam.toUpperCase());
    }

    return { status: 200, data: result };
  }

  // ── GET /tasks/my-tasks ───────────────────────────────────────────────────────
  if (method === 'get' && cleanUrl === '/tasks/my-tasks') {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('workforce_user'));
    } catch (e) {}
    const currentEmp = employees.find(e =>
      (currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.id && (Number(e.userId) === Number(currentUser.id) || Number(e.id) === Number(currentUser.id)))
    );
    const empId = currentEmp?.id;
    const empName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || '';

    const myTasks = tasks.filter(t => {
      if (empId && Number(t.assignedEmployeeId) === Number(empId)) return true;
      if (empName && t.assignedEmployeeName && t.assignedEmployeeName.toLowerCase() === empName.toLowerCase()) return true;
      if (empName && t.employeeName && t.employeeName.toLowerCase() === empName.toLowerCase()) return true;
      if (currentUser?.username && t.assignedUsername && t.assignedUsername === currentUser.username) return true;
      return false;
    });
    return { status: 200, data: myTasks };
  }

  // ── GET /projects/my-projects ─────────────────────────────────────────────────
  if (method === 'get' && cleanUrl === '/projects/my-projects') {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('workforce_user'));
    } catch (e) {}
    const currentEmp = employees.find(e =>
      (currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.id && (Number(e.userId) === Number(currentUser.id) || Number(e.id) === Number(currentUser.id)))
    );
    const empId = currentEmp?.id;
    const empName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || '';
    const myTasks = tasks.filter(t => {
      if (empId && Number(t.assignedEmployeeId) === Number(empId)) return true;
      if (empName && t.assignedEmployeeName && t.assignedEmployeeName.toLowerCase() === empName.toLowerCase()) return true;
      if (empName && t.employeeName && t.employeeName.toLowerCase() === empName.toLowerCase()) return true;
      return false;
    });
    const myTaskProjectIds = [...new Set(myTasks.map(t => Number(t.projectId)).filter(Boolean))];
    const myDirectProjects = empId
      ? projects.filter(p => Array.isArray(p.assignedEmployeeIds) && p.assignedEmployeeIds.some(id => Number(id) === Number(empId)))
      : [];
    const allMyProjectIds = [...new Set([...myTaskProjectIds, ...myDirectProjects.map(p => Number(p.id))])];
    const myProjects = projects.filter(p => allMyProjectIds.includes(Number(p.id)));
    return { status: 200, data: myProjects };
  }

  // ── POST /tasks ──────────────────────────────────────────────────────────────
  if (method === 'post' && cleanUrl === '/tasks') {
    // Re-read tasks fresh to avoid stale count
    const latestTasks = getStorage('tasks', defaultTasks);
    const maxTaskNum = latestTasks.reduce((max, taskItem) => {
      const num = parseInt((taskItem.taskNumber || '').replace('TSK-', '')) || 0;
      return num > max ? num : max;
    }, 1000);

    const empId = data.assignedEmployeeId ? Number(data.assignedEmployeeId) : null;
    const emp = empId ? employees.find(e => Number(e.id) === Number(empId)) : null;
    const proj = data.projectId ? projects.find(p => Number(p.id) === Number(data.projectId)) : null;

    const newTask = {
      id: Date.now(),
      taskNumber: data.taskNumber || `TSK-${maxTaskNum + 1}`,
      ...data,
      projectId: Number(data.projectId),
      projectName: proj ? proj.name : (data.projectName || ''),
      assignedEmployeeId: empId,
      assignedEmployeeName: emp ? `${emp.firstName} ${emp.lastName}` : (data.assignedEmployeeName || ''),
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : (data.employeeName || ''),
    };
    latestTasks.push(newTask);
    setStorage('tasks', latestTasks);
    syncProjectFromTasks(newTask.projectId);
    return { status: 201, data: newTask };
  }

  // ── PUT /tasks/:id ───────────────────────────────────────────────────────────
  if (method === 'put' && cleanUrl.startsWith('/tasks/')) {
    const id    = parseInt(cleanUrl.split('/')[2]);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldProjectId  = tasks[index].projectId;
      const updatedTask   = { ...tasks[index], ...data };
      tasks[index]        = updatedTask;
      setStorage('tasks', tasks);

      // Sync the project that owns this task
      syncProjectFromTasks(updatedTask.projectId);

      // If the task was moved to a different project, also sync the old project
      if (oldProjectId && Number(oldProjectId) !== Number(updatedTask.projectId)) {
        syncProjectFromTasks(oldProjectId);
      }
      return { status: 200, data: updatedTask };
    }
  }

  // ── DELETE /tasks/:id ────────────────────────────────────────────────────────
  if (method === 'delete' && cleanUrl.startsWith('/tasks/')) {
    const id          = parseInt(cleanUrl.split('/')[2]);
    const taskToDelete = tasks.find(t => t.id === id);
    setStorage('tasks', tasks.filter(t => t.id !== id));
    if (taskToDelete) syncProjectFromTasks(taskToDelete.projectId);
    return { status: 200, data: { message: 'Deleted successfully' } };
  }

  if (method === 'get' && cleanUrl === '/dashboard/stats') {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('workforce_user'));
    } catch (e) {}

    const totalEmployees = employees.length;
    const totalProjects = projects.length;
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE' || t.status === 'Completed' || t.status === 'Done').length;
    const pendingTasks = totalTasksCount - completedTasksCount;
    const urgentTasks = tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH' || t.priority === 'Urgent' || t.priority === 'High').length;
    const taskCompletionRate = totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);

    const activeProjectsList = projects.map(p => {
      const pTasks = tasks.filter(t => Number(t.projectId) === Number(p.id));
      const done = pTasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE' || t.status === 'Completed' || t.status === 'Done').length;
      return {
        ...p,
        totalTasks: pTasks.length,
        completedTasks: done,
        pendingTasks: pTasks.length - done
      };
    });
    const activeProjects = activeProjectsList.filter(p => p.status !== 'Completed' && p.status !== 'COMPLETED').length;

    // Department breakdown
    const deptMap = {};
    employees.forEach(emp => {
      const dept = emp.department || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const departmentBreakdown = Object.keys(deptMap).map(dept => ({
      name: dept,
      count: deptMap[dept],
      percentage: totalEmployees === 0 ? 0 : Math.round((deptMap[dept] / totalEmployees) * 100)
    }));

    // Employee specific data — resolve by email (most reliable), then by userId link, then by name
    const currentEmp = employees.find(e =>
      (currentUser?.email && e.email === currentUser.email) ||
      (currentUser?.id && (Number(e.userId) === Number(currentUser.id) || Number(e.id) === Number(currentUser.id)))
    );
    const empId = currentEmp?.id;
    const empName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || '';

    const myAssignedTasks = tasks.filter(t => {
      if (empId && Number(t.assignedEmployeeId) === Number(empId)) return true;
      if (empName && t.assignedEmployeeName && t.assignedEmployeeName.toLowerCase() === empName.toLowerCase()) return true;
      if (empName && t.employeeName && t.employeeName.toLowerCase() === empName.toLowerCase()) return true;
      // Also match by current user's username stored in task
      if (currentUser?.username && t.assignedUsername && t.assignedUsername === currentUser.username) return true;
      return false;
    });
    const myCompletedTasksCount = myAssignedTasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE' || t.status === 'Completed' || t.status === 'Done').length;
    const myPendingTasksCount = myAssignedTasks.length - myCompletedTasksCount;
    const myTaskCompletionRate = myAssignedTasks.length === 0 ? 0 : Math.round((myCompletedTasksCount / myAssignedTasks.length) * 100);

    // Also include projects where the employee is directly assigned via assignedEmployeeIds
    const myProjectIds = [...new Set(myAssignedTasks.map(t => Number(t.projectId)).filter(Boolean))];
    const myDirectProjects = empId
      ? projects.filter(p => Array.isArray(p.assignedEmployeeIds) && p.assignedEmployeeIds.some(id => Number(id) === Number(empId)))
      : [];
    const myDirectProjectIds = myDirectProjects.map(p => Number(p.id));
    const allMyProjectIds = [...new Set([...myProjectIds, ...myDirectProjectIds])];
    const myAssignedProjects = activeProjectsList.filter(p => allMyProjectIds.includes(Number(p.id)));

    const upcomingDeadlines = myAssignedTasks
      .filter(t => t.status !== 'COMPLETED' && t.status !== 'DONE' && t.status !== 'Completed' && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate || '2099-12-31') - new Date(b.dueDate || '2099-12-31'));

    const notifications = auditLogs.slice(-6).reverse().map((log, index) => ({
      id: log.id || `notif-${index}`,
      message: log.details || `${log.action} performed by ${log.performedBy || 'system'}`,
      timestamp: log.timestamp || 'Just now',
      type: log.action || 'INFO'
    }));

    return {
      status: 200,
      data: {
        totalEmployees,
        totalWorkforce: totalEmployees,
        totalProjects,
        activeProjects,
        totalTasksCount,
        completedTasksCount,
        pendingTasks,
        urgentTasks,
        taskCompletionRate,
        recentActivities: auditLogs.slice(-5).reverse(),
        activeProjectsList,
        activeProjectsOverview: activeProjectsList,
        departmentBreakdown,
        // Employee dashboard fields
        myAssignedTasks,
        myAssignedProjects,
        upcomingDeadlines,
        assignedTasksCount: myAssignedTasks.length,
        completedTasksCount: myCompletedTasksCount,
        pendingTasksCount: myPendingTasksCount,
        taskCompletionRate: myTaskCompletionRate,
        notifications
      }
    };
  }

  if (method === 'get' && cleanUrl === '/audit-logs') {
    return { status: 200, data: auditLogs };
  }

  if (method === 'get' && cleanUrl === '/reports/employee-productivity') {
    const report = employees.map(emp => {
      const empTasks = tasks.filter(t => Number(t.assignedEmployeeId) === Number(emp.id));
      const completed = empTasks.filter(t => 
        t.status === 'DONE' || 
        t.status === 'COMPLETED' || 
        t.status === 'Completed' ||
        t.status === 'Done'
      ).length;
      const pending = empTasks.length - completed;
      const rate = empTasks.length === 0 ? 0 : Math.round((completed / empTasks.length) * 100);
      return {
        employeeCode: emp.code,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        totalAssigned: empTasks.length,
        completed: completed,
        pending: pending,
        completionRate: `${rate}%`
      };
    });
    return { status: 200, data: report };
  }

  if (method === 'get' && cleanUrl === '/reports/project-health') {
    const report = projects.map(prj => {
      const prjTasks = tasks.filter(t => Number(t.projectId) === Number(prj.id));
      const completed = prjTasks.filter(t => 
        t.status === 'DONE' || 
        t.status === 'COMPLETED' || 
        t.status === 'Completed' ||
        t.status === 'Done'
      ).length;
      const progress = prjTasks.length === 0 ? prj.progress || 0 : Math.round((completed / prjTasks.length) * 100);
      
      let status = prj.status || 'In Progress';
      if (progress === 100) {
        status = 'Completed';
      } else if (progress === 0 && status === 'In Progress') {
        status = 'Not Started';
      }
      
      return {
        projectCode: prj.code,
        projectName: prj.name,
        department: prj.department,
        status: status,
        budget: prj.budget || 200000,
        deadline: prj.deadline || '2026-12-31',
        progress: progress
      };
    });
    return { status: 200, data: report };
  }

  if (method === 'get' && cleanUrl === '/reports/task-status') {
    const report = tasks.map(task => {
      const prj = projects.find(p => Number(p.id) === Number(task.projectId));
      const emp = employees.find(e => Number(e.id) === Number(task.assignedEmployeeId));
      return {
        taskId: task.id,
        taskTitle: task.title,
        projectName: prj ? prj.name : 'Unassigned',
        assignedTo: emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate || '2026-12-31'
      };
    });
    return { status: 200, data: report };
  }

  if (method === 'get' && cleanUrl.startsWith('/reports/')) {
    return {
      status: 200,
      data: {
        departmentSummary: [
          { department: 'Engineering', count: 12, budget: 12000000 },
          { department: 'Human Resources', count: 5, budget: 4000000 },
          { department: 'Finance', count: 6, budget: 5500000 },
          { department: 'Management', count: 4, budget: 8000000 },
        ],
        productivityScore: 92.4,
        completedProjects: 8
      }
    };
  }

  if (method === 'get' && cleanUrl === '/swagger-docs') {
    return {
      status: 200,
      data: {
        title: 'WorkforceHub Enterprise API',
        version: 'v1.0.0',
        endpoints: [
          { path: '/api/auth/login', method: 'POST', description: 'Authenticate user & issue JWT token' },
          { path: '/api/auth/register', method: 'POST', description: 'Register new employee and user account' },
          { path: '/api/employees', method: 'GET', description: 'Retrieve all workforce employees' },
          { path: '/api/projects', method: 'GET', description: 'Retrieve enterprise projects' },
          { path: '/api/tasks', method: 'GET', description: 'Retrieve agile tasks and kanban items' },
          { path: '/api/dashboard/stats', method: 'GET', description: 'Retrieve executive KPIs and dashboard metrics' }
        ]
      }
    };
  }

  return { status: 200, data: { message: 'Mock success' } };
};

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workforce_jwt_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with Mock Fallback for SPA offline environments
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend is offline or returns 404/Network Error, fallback to mock adapter
    const config = error.config;
    if (!error.response || error.response.status === 404 || error.response.status >= 500) {
      const method = config.method ? config.method.toLowerCase() : 'get';
      const url = config.url || '';
      let data = null;
      try {
        data = config.data ? JSON.parse(config.data) : null;
      } catch (e) {
        data = config.data;
      }
      
      const mockRes = handleMockRequest(method, url, data);
      if (mockRes.status >= 400) {
        const err = new Error(mockRes.data.message || 'Request failed');
        err.response = mockRes;
        return Promise.reject(err);
      }
      return {
        data: mockRes.data,
        status: mockRes.status,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (error.response && error.response.status === 401) {
      // If it's a login 401 from mock or backend, let it pass to caller
      if (config.url && config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }
      localStorage.removeItem('workforce_jwt_token');
      localStorage.removeItem('workforce_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Email API ──────────────────────────────────────────────────
API.sendEmail = (emailData) => API.post('/api/email/send', emailData);
API.broadcastEmail = (emailData) => API.post('/api/email/broadcast', emailData);
API.testEmail = (toEmail) => API.get(`/api/email/test?to=${encodeURIComponent(toEmail)}`);

export default API;
