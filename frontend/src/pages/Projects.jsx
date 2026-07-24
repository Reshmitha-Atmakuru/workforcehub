import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  IndianRupee,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckSquare,
  X
} from 'lucide-react';

const PRESET_TASK_OPTIONS = [
  'Architecture & Technical Specification',
  'Database Schema & Setup',
  'REST API Endpoints Development',
  'Frontend UI Components Implementation',
  'QA & Automated Unit Testing',
  'DevOps & CI/CD Deployment',
  'Security Audit & User Acceptance'
];

export default function Projects() {
  const { isAdmin, isEmployee, canManageProjects, canManageEmployees } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial Tasks during project creation
  const [initialTasks, setInitialTasks] = useState([]);
  const [customTaskTitle, setCustomTaskTitle] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrj, setSelectedPrj] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [appliedMemberSearch, setAppliedMemberSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: 'Engineering',
    priority: 'HIGH',
    status: 'In Progress',
    budget: 200000,
    startDate: new Date().toISOString().split('T')[0],
    deadline: '2026-12-31',
    assignedEmployeeIds: [],
  });

  useEffect(() => {
    fetchData();
  }, [search, department, status, priority, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      const projectEndpoint = (!canManageProjects && isEmployee) ? '/projects/my-projects' : '/projects';
      // Backend supports: search, department, status only
      // priority filter and sortBy/sortOrder are applied client-side below
      const backendParams = {};
      if (search && search.trim()) backendParams.search = search.trim();
      if (department && department !== 'All') backendParams.department = department;
      if (status && status !== 'All') backendParams.status = status;

      const requests = [API.get(projectEndpoint, { params: backendParams })];
      if (canManageProjects || canManageEmployees || isEmployee) {
        requests.push(API.get('/employees'));
      }
      const [resPrj, resEmp] = await Promise.all(requests);
      const prjList = Array.isArray(resPrj.data)
        ? resPrj.data
        : (Array.isArray(resPrj.data?.data) ? resPrj.data.data : (Array.isArray(resPrj.data?.content) ? resPrj.data.content : []));
      const empList = resEmp ? (Array.isArray(resEmp.data)
        ? resEmp.data
        : (Array.isArray(resEmp.data?.data) ? resEmp.data.data : (Array.isArray(resEmp.data?.content) ? resEmp.data.content : []))) : [];
      setProjects(prjList);
      setEmployees(empList);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPresetTask = (title) => {
    if (initialTasks.some((t) => t.title === title)) return;
    setInitialTasks([
      ...initialTasks,
      {
        title,
        assignedEmployeeId: formData.assignedEmployeeIds[0] || '',
        priority: 'HIGH',
      },
    ]);
  };

  const handleAddCustomTask = () => {
    if (!customTaskTitle.trim()) return;
    setInitialTasks([
      ...initialTasks,
      {
        title: customTaskTitle.trim(),
        assignedEmployeeId: formData.assignedEmployeeIds[0] || '',
        priority: 'HIGH',
      },
    ]);
    setCustomTaskTitle('');
  };

  const handleRemoveTask = (index) => {
    setInitialTasks(initialTasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...initialTasks];
    updated[index][field] = value;
    setInitialTasks(updated);
  };

  const handleOpenAdd = () => {
    setSelectedPrj(null);
    setMemberSearch('');
    setAppliedMemberSearch('');
    setInitialTasks([]);
    setCustomTaskTitle('');
    setFormData({
      name: '',
      description: '',
      department: 'Engineering',
      priority: 'HIGH',
      status: 'In Progress',
      budget: 200000,
      startDate: new Date().toISOString().split('T')[0],
      deadline: '2026-12-31',
      assignedEmployeeIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prj) => {
    setSelectedPrj(prj);
    setMemberSearch('');
    setAppliedMemberSearch('');
    setInitialTasks([]);
    setCustomTaskTitle('');
    setFormData({
      name: prj.name || '',
      description: prj.description || '',
      department: prj.department || 'Engineering',
      priority: prj.priority || 'HIGH',
      status: prj.status || 'In Progress',
      budget: prj.budget || 200000,
      startDate: prj.startDate || new Date().toISOString().split('T')[0],
      deadline: prj.deadline || '2026-12-31',
      assignedEmployeeIds: prj.assignedEmployeeIds || [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Include any custom task title typed in box if user didn't click + Add Task button
      let finalTasks = [...initialTasks];
      if (customTaskTitle && customTaskTitle.trim()) {
        finalTasks.push({
          title: customTaskTitle.trim(),
          assignedEmployeeId: formData.assignedEmployeeIds[0] || '',
          priority: 'HIGH',
        });
      }

      const sanitizedTasks = finalTasks.map(t => ({
        ...t,
        assignedEmployeeId: t.assignedEmployeeId ? Number(t.assignedEmployeeId) : null,
      }));

      if (selectedPrj) {
        await API.put(`/projects/${selectedPrj.id}`, { ...formData, initialTasks: sanitizedTasks });
      } else {
        await API.post('/projects', { ...formData, initialTasks: sanitizedTasks });
        setSearch('');
        setDepartment('All');
        setStatus('All');
        setPriority('All');
      }
      setIsModalOpen(false);
      setInitialTasks([]);
      setCustomTaskTitle('');
      window.dispatchEvent(new CustomEvent('workforcehub:data-updated', { detail: { type: 'project-saved' } }));
      await fetchData();
    } catch (err) {
      console.error('Error saving project:', err);
      alert(err.response?.data?.message || 'Error saving project');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/projects/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting project');
    }
  };

  const toggleEmployeeAssign = (empId) => {
    const list = [...formData.assignedEmployeeIds];
    const index = list.indexOf(empId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(empId);
    }
    setFormData({ ...formData, assignedEmployeeIds: list });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Portfolio & Resource Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track operational timelines, resource allocations, sprint completion rates, and budgets.
          </p>
        </div>

        {canManageProjects && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search projects by code, title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Operations & Infrastructure">Operations & Infrastructure</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="name-ASC">Sort: Letters / Name (A-Z)</option>
              <option value="name-DESC">Sort: Letters / Name (Z-A)</option>
              <option value="department-ASC">Sort: Department Name (A-Z)</option>
              <option value="department-DESC">Sort: Department Name (Z-A)</option>
              <option value="status-ASC">Sort: Status (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading projects...</div>
      ) : !Array.isArray(projects) || projects.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(() => {
            // Client-side priority filter + sort (backend doesn't support these params)
            let filtered = [...projects];
            if (priority && priority !== 'All') {
              filtered = filtered.filter(p => p.priority && p.priority.toUpperCase() === priority.toUpperCase());
            }
            if (sortBy) {
              filtered.sort((a, b) => {
                let valA = a[sortBy] ?? '';
                let valB = b[sortBy] ?? '';
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortOrder === 'DESC' ? 1 : -1;
                if (valA > valB) return sortOrder === 'DESC' ? -1 : 1;
                return 0;
              });
            }
            return filtered;
          })().map((prj) => {
            const assignedEmps = (Array.isArray(employees) ? employees : []).filter((e) => prj.assignedEmployeeIds?.includes(e.id));
            return (
              <div
                key={prj.id}
                className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                        {prj.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          prj.priority === 'URGENT'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : prj.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {prj.priority}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        prj.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : prj.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {prj.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{prj.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{prj.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Sprint Completion</span>
                      <span className={`font-bold ${prj.progress === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>{prj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          prj.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                        }`}
                        style={{ width: `${prj.progress}%` }}
                      ></div>
                    </div>

                    {/* Task Completion Breakdown */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Tasks</p>
                        <p className="text-sm font-bold text-white">{prj.totalTasks ?? 0}</p>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-400 uppercase font-semibold">Completed</p>
                        <p className="text-sm font-bold text-emerald-400">{prj.completedTasks ?? 0}</p>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <p className="text-[10px] text-amber-400 uppercase font-semibold">Pending</p>
                        <p className="text-sm font-bold text-amber-400">{prj.pendingTasks ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-[#131d38] p-3 rounded-xl mb-4 border border-slate-800">
                    <div>
                      <span>Department:</span> <strong className="text-slate-200 block">{prj.department}</strong>
                    </div>
                    <div>
                      <span>Budget:</span> <strong className="text-emerald-400 block">₹{prj.budget?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span>Start Date:</span> <strong className="text-slate-300 block">{prj.startDate}</strong>
                    </div>
                    <div>
                      <span>Deadline:</span> <strong className="text-amber-300 block">{prj.deadline}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Assigned Team */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold mb-1 uppercase">ASSIGNED TEAM ({assignedEmps.length})</p>
                    <div className="flex items-center -space-x-2">
                      {assignedEmps.slice(0, 4).map((emp) => (
                        <div
                          key={emp.id}
                          title={`${emp.firstName} ${emp.lastName} (${emp.jobTitle})`}
                          className="w-7 h-7 rounded-full bg-blue-600 border-2 border-[#0f172a] text-white flex items-center justify-center font-bold text-[10px]"
                        >
                          {emp.firstName[0]}
                        </div>
                      ))}
                      {assignedEmps.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-[#0f172a] text-slate-300 flex items-center justify-center text-[10px] font-bold">
                          +{assignedEmps.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/tasks?projectId=${prj.id}`)}
                      className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      title="View & Filter Project Tasks"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>View Tasks</span>
                    </button>
                    {canManageProjects && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(prj)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(prj.id)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPrj ? `Edit Project (${selectedPrj.code})` : 'Create New Project'}
        subtitle="Configure department scope, sprint goals, budgets, and assign workforce members."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Smart Workforce & Security Suite"
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline business objectives and architectural requirements..."
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Operations & Infrastructure">Operations & Infrastructure</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Budget Allocation (₹ INR)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Assigned Employees Checklist with Search */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Assign Workforce Team Members</label>
            
            {/* Search Input and Button */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setAppliedMemberSearch(memberSearch);
                    }
                  }}
                  placeholder="Search team member by name, department, or job title..."
                  className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-1.5 px-3 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={() => setAppliedMemberSearch(memberSearch)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              {(memberSearch || appliedMemberSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearch('');
                    setAppliedMemberSearch('');
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-40 overflow-y-auto bg-[#131d38] border border-slate-700/80 rounded-xl p-3 space-y-2">
              {(Array.isArray(employees) ? employees : [])
                .filter((emp) => {
                  const searchTerm = (appliedMemberSearch || memberSearch).toLowerCase().trim();
                  if (!searchTerm) return true;
                  const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
                  const dept = (emp.department || '').toLowerCase();
                  const code = (emp.code || '').toLowerCase();
                  const title = (emp.jobTitle || '').toLowerCase();
                  return fullName.includes(searchTerm) || dept.includes(searchTerm) || code.includes(searchTerm) || title.includes(searchTerm);
                })
                .map((emp) => {
                  const isAssigned = formData.assignedEmployeeIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployeeAssign(emp.id)}
                      className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isAssigned ? 'bg-blue-600/20 text-white border border-blue-500/40' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{emp.firstName} {emp.lastName}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({emp.code} - {emp.department} - {emp.jobTitle})</span>
                      </div>
                      {isAssigned && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tasks & Deliverables Configuration */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-white mb-0.5">Project Tasks & Deliverables</label>
              <p className="text-[11px] text-slate-400">Add tasks directly using quick options or typing manually below.</p>
            </div>

              {/* Task Presets */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">Preset Deliverables:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TASK_OPTIONS.map((opt) => {
                    const isAdded = initialTasks.some((t) => t.title === opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAddPresetTask(opt)}
                        disabled={isAdded}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-slate-800 text-slate-500 border-slate-700/50 cursor-not-allowed'
                            : 'bg-[#131d38] hover:bg-blue-600/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Task Typing */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTask();
                    }
                  }}
                  placeholder="Or type custom task title..."
                  className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTask}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Draft Tasks List */}
              {initialTasks.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Configured Deliverable Tasks ({initialTasks.length}):</span>
                  {initialTasks.map((task, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#131d38] border border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1 font-medium text-white truncate">{task.title}</div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={task.assignedEmployeeId}
                          onChange={(e) => handleTaskChange(idx, 'assignedEmployeeId', e.target.value)}
                          className="bg-[#0f172a] border border-slate-700 text-slate-200 text-[11px] rounded-lg py-1 px-2 focus:outline-none"
                        >
                          <option value="">Auto Assign</option>
                          {(Array.isArray(employees) ? employees : []).map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </select>

                        <select
                          value={task.priority}
                          onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                          className="bg-[#0f172a] border border-slate-700 text-slate-200 text-[11px] rounded-lg py-1 px-2 focus:outline-none"
                        >
                          <option value="URGENT">URGENT</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove task"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
            >
              {selectedPrj ? 'Save Project Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteId && (
        <Modal isOpen={true} onClose={() => setDeleteId(null)} title="Confirm Project Deletion">
          <div className="space-y-4">
            <p className="text-xs text-slate-300">Are you sure you want to delete this project record?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
