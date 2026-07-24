import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Kanban as KanbanIcon,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  User,
  AlertCircle
} from 'lucide-react';

export default function Kanban() {
  const { isAdmin, canManageTasks, canManageEmployees } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requests = [API.get('/tasks'), API.get('/projects')];
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
      setEmployees(empList);
      setProjects(prjList);
    } catch (err) {
      console.error('Error loading Kanban data:', err);
      setTasks([]);
      setEmployees([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const moveTaskStatus = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let newProgress = task.progress;
      if (newStatus === 'COMPLETED') newProgress = 100;
      if (newStatus === 'TODO' && newProgress === 100) newProgress = 0;

      await API.put(`/tasks/${taskId}`, {
        ...task,
        status: newStatus,
        progress: newProgress,
      });

      fetchData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-700 bg-slate-900/50' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-500/30 bg-blue-950/20' },
    { id: 'UNDER_REVIEW', title: 'Under Review', color: 'border-amber-500/30 bg-amber-950/20' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500/30 bg-emerald-950/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <KanbanIcon className="w-6 h-6 text-blue-400" />
            <span>Interactive Sprint Kanban Board</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual workflow management for engineering sprints and task status transitions.
          </p>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading sprint board...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = (Array.isArray(tasks) ? tasks : []).filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`p-4 rounded-2xl border ${col.color} min-h-[600px] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      {col.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-bold font-mono bg-slate-800 text-slate-300 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((t) => {
                      const emp = (Array.isArray(employees) ? employees : []).find((e) => e.id === t.assignedEmployeeId);
                      const prj = (Array.isArray(projects) ? projects : []).find((p) => p.id === t.projectId);

                      return (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl bg-[#0f172a] border border-slate-800/90 shadow-md hover:border-blue-500/50 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono font-bold text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              {t.taskNumber}
                            </span>
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded ${
                                t.priority === 'URGENT'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : t.priority === 'HIGH'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-white leading-snug">{t.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-400 font-mono text-[10px]">{prj?.code || 'PRJ'}</span>
                            <span className="text-blue-400 font-bold">{t.progress}%</span>
                          </div>

                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${t.progress}%` }}
                            ></div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">
                                {emp ? emp.firstName[0] : 'U'}
                              </div>
                              <span className="truncate max-w-[90px]">{emp ? emp.firstName : 'Unassigned'}</span>
                            </div>

                            {/* Move Action Controls */}
                            <div className="flex items-center gap-1">
                              {col.id !== 'TODO' && (
                                <button
                                  onClick={() => {
                                    const prevStatus = col.id === 'COMPLETED' ? 'UNDER_REVIEW' : col.id === 'UNDER_REVIEW' ? 'IN_PROGRESS' : 'TODO';
                                    moveTaskStatus(t.id, prevStatus);
                                  }}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {col.id !== 'COMPLETED' && (
                                <button
                                  onClick={() => {
                                    const nextStatus = col.id === 'TODO' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'UNDER_REVIEW' : 'COMPLETED';
                                    moveTaskStatus(t.id, nextStatus);
                                  }}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
