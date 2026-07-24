import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Plus,
  Search,
  User,
  Briefcase,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export default function Tasks() {
  const { isAdmin, canManageTasks, canManageEmployees } = useAuth();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState(() => urlProjectId || 'All');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  useEffect(() => {
    if (urlProjectId) {
      setProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedEmployeeId: '',
    priority: 'HIGH',
    status: 'TODO',
    progress: 0,
    remarks: 'Task initialized',
    dueDate: '2026-08-15',
  });

  useEffect(() => {
    fetchData();
  }, [search, projectId, assignedEmployeeId, status, priority]);

  // Refresh tasks when navigating back to this page OR when a project was just created
  useEffect(() => {
    const handleDataUpdate = () => fetchData();
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchData(); };
    window.addEventListener('workforcehub:data-updated', handleDataUpdate);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('workforcehub:data-updated', handleDataUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [search, projectId, assignedEmployeeId, status, priority]);

  const fetchData = async () => {
    try {
      const requests = [
        API.get('/tasks', { params: { search, projectId, assignedEmployeeId, status, priority } }),
        API.get('/projects')
      ];
      if (canManageTasks || canManageEmployees || isAdmin) {
        requests.push(API.get('/employees'));
      }
      const [resTasks, resPrjs, resEmps] = await Promise.all(requests);
      const taskList = Array.isArray(resTasks.data)
        ? resTasks.data
        : (Array.isArray(resTasks.data?.data) ? resTasks.data.data : (Array.isArray(resTasks.data?.content) ? resTasks.data.content : []));
      const prjList = Array.isArray(resPrjs.data)
        ? resPrjs.data
        : (Array.isArray(resPrjs.data?.data) ? resPrjs.data.data : (Array.isArray(resPrjs.data?.content) ? resPrjs.data.content : []));
      const empList = resEmps ? (Array.isArray(resEmps.data)
        ? resEmps.data
        : (Array.isArray(resEmps.data?.data) ? resEmps.data.data : (Array.isArray(resEmps.data?.content) ? resEmps.data.content : []))) : [];
      setTasks(taskList);
      setProjects(prjList);
      setEmployees(empList);
    } catch (err) {
      console.error('Error loading task registry:', err);
      setTasks([]);
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      assignedEmployeeId: employees[0]?.id || '',
      priority: 'HIGH',
      status: 'TODO',
      progress: 0,
      remarks: 'Assigned to workforce member',
      dueDate: '2026-08-15',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      projectId: task.projectId || '',
      assignedEmployeeId: task.assignedEmployeeId || '',
      priority: task.priority || 'HIGH',
      status: task.status || 'IN_PROGRESS',
      progress: task.progress || 0,
      remarks: task.remarks || '',
      dueDate: task.dueDate || '2026-08-15',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await API.put(`/tasks/${selectedTask.id}`, formData);
      } else {
        await API.post('/tasks', formData);
      }
      setIsModalOpen(false);
      // Notify Dashboard and other pages to refresh
      window.dispatchEvent(new CustomEvent('workforcehub:data-updated', { detail: { type: 'task-saved' } }));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving task');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/tasks/${deleteId}`);
      setDeleteId(null);
      // Notify Dashboard and Projects to refresh
      window.dispatchEvent(new CustomEvent('workforcehub:data-updated', { detail: { type: 'task-deleted' } }));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Task Registry & Deliverables Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign work items, track percentage completion, update status workflows, and append remarks.
          </p>
        </div>

        {canManageTasks && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Task Item</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by task number, title, description or remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Projects</option>
              {(Array.isArray(projects) ? projects : []).map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
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
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading task registry...</div>
        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No tasks found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131e3b] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Task #</th>
                  <th className="py-3.5 px-4">Task Title & Description</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status & Progress</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {(Array.isArray(tasks) ? tasks : []).map((task) => {
                  const prj = (Array.isArray(projects) ? projects : []).find((p) => p.id === task.projectId);
                  const emp = (Array.isArray(employees) ? employees : []).find((e) => e.id === task.assignedEmployeeId);
                  return (
                    <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                        {task.taskNumber}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-white">{task.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{task.description}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {prj ? prj.code : 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned'}
                        </div>
                        <div className="text-[10px] text-slate-500">{emp?.jobTitle}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            task.priority === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {task.status}
                          </span>
                          <span className="font-mono font-bold text-blue-400">{task.progress}%</span>
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-[11px] text-slate-400 italic">
                        "{task.remarks || 'No remarks'}"
                      </td>

                      <td className="py-3.5 px-4 text-[11px] font-mono text-amber-300">
                        {task.dueDate}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors cursor-pointer"
                          title="Update Task Progress / Remarks"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(task.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? `Edit Task (${selectedTask.taskNumber})` : 'Create New Deliverable Task'}
        subtitle="Assign workforce members, update status lifecycle, and record progress remarks."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement security verification and input sanitization"
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Project</label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {(Array.isArray(projects) ? projects : []).map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Employee</label>
              <select
                required
                value={formData.assignedEmployeeId}
                onChange={(e) => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {(Array.isArray(employees) ? employees : []).map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.code} - {emp.jobTitle})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Workflow</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Progress % ({formData.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Remarks & Status Notes</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="e.g. Token validation working as expected."
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
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
              {selectedTask ? 'Save Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteId && (
        <Modal isOpen={true} onClose={() => setDeleteId(null)} title="Confirm Task Deletion">
          <div className="space-y-4">
            <p className="text-xs text-slate-300">Are you sure you want to delete this task item?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
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
