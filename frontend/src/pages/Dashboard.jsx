import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckSquare,
  Award,
  Plus,
  BarChart3,
  Kanban,
  History,
  ArrowRight,
  Clock,
  Download,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Bell,
  User,
  Activity,
  Layers,
  PieChart
} from 'lucide-react';

export default function Dashboard({ onOpenNewEmployeeModal }) {
  const { user, isAdmin, canManageEmployees } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // Refresh dashboard when tasks or projects are created elsewhere in the app
    const handleDataUpdate = () => fetchDashboardStats();
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchDashboardStats(); };
    window.addEventListener('workforcehub:data-updated', handleDataUpdate);
    document.addEventListener('visibilitychange', handleVisibility);
    // Auto-refresh every 30 seconds so Admin->Employee assignment updates are visible without manual reload
    const pollInterval = setInterval(fetchDashboardStats, 30000);
    return () => {
      window.removeEventListener('workforcehub:data-updated', handleDataUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(pollInterval);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Dashboard Metrics...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // EMPLOYEE DASHBOARD VIEW (Strictly isolated from Admin view)
  // =========================================================================
  if (!isAdmin) {
    const assignedTasks = Array.isArray(stats?.myAssignedTasks) ? stats.myAssignedTasks : [];
    const assignedProjects = Array.isArray(stats?.myAssignedProjects) ? stats.myAssignedProjects : [];
    const upcomingDeadlines = Array.isArray(stats?.upcomingDeadlines) ? stats.upcomingDeadlines : [];
    const notifications = Array.isArray(stats?.notifications) ? stats.notifications : [];

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#101b38] via-[#0f1832] to-[#0d152a] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                EMPLOYEE PORTAL
              </span>
              <span className="text-xs text-slate-400 font-mono">My Personal Workstation</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400 font-semibold">{user?.firstName || user?.username || 'Employee'}</span>!
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Track your assigned tasks, monitor project progress, stay updated on upcoming deadlines and system notifications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>My Tasks</span>
            </button>
          </div>
        </div>

        {/* Employee Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: My Tasks */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">My Tasks</p>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.assignedTasksCount ?? assignedTasks.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Total deliverables assigned to you</p>
          </div>

          {/* Card 2: Completed Tasks */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">Completed Tasks</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            {/* FIX: Use employee-specific completedTasksCount (assignedTasksCount - pendingTasksCount) */}
            <p className="text-2xl font-bold text-white">{(stats?.assignedTasksCount ?? 0) - (stats?.pendingTasksCount ?? 0)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Successfully delivered items</p>
          </div>

          {/* Card 3: Pending Tasks */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">Pending Tasks</p>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.pendingTasksCount ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Tasks requiring your attention</p>
          </div>

          {/* Card 4: Task Progress */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400">Task Progress</p>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            {/* FIX: Compute employee-specific completion rate from personal tasks */}
            {(() => {
              const total = stats?.assignedTasksCount ?? 0;
              const pending = stats?.pendingTasksCount ?? 0;
              const done = total - pending;
              const rate = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <>
                  <p className="text-2xl font-bold text-white">{rate}%</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Middle Grid: My Projects & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Projects */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  My Projects
                </h3>
                <p className="text-xs text-slate-400">Projects you are actively assigned to</p>
              </div>
              <button onClick={() => navigate('/projects')} className="text-xs text-blue-400 hover:underline font-semibold">
                View All Projects →
              </button>
            </div>

            {assignedProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-medium">No projects assigned to you yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Contact your manager to be added to active project teams.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {assignedProjects.map((prj, index) => (
                  <div key={prj.id || `prj-${index}`} className="p-4 rounded-xl bg-[#131d38] border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-blue-400 rounded border border-slate-700">
                          {prj.code}
                        </span>
                        <h4 className="font-semibold text-xs text-white">{prj.name}</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{prj.progress || 0}% Completed</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">{prj.description || 'Enterprise project deliverable'}</p>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${prj.progress || 0}%` }}></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-1 rounded bg-slate-800/60 text-slate-300">Total Tasks: <strong>{prj.totalTasks ?? 0}</strong></div>
                      <div className="p-1 rounded bg-emerald-500/10 text-emerald-300">Done: <strong>{prj.completedTasks ?? 0}</strong></div>
                      <div className="p-1 rounded bg-amber-500/10 text-amber-300">Pending: <strong>{prj.pendingTasks ?? 0}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
            <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Upcoming Deadlines
            </h3>
            <p className="text-xs text-slate-400 mb-4">Pending items requiring attention</p>

            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-xs font-medium">All tasks up to date!</p>
                <p className="text-[11px] text-slate-500 mt-1">No urgent pending deadlines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-[#131d38] border border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-semibold text-xs text-white line-clamp-1">{task.title}</h5>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Due: {task.dueDate || 'Soon'}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      task.priority === 'URGENT' || task.priority === 'HIGH' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {task.priority || 'MEDIUM'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Recent Activity Feed for Employee */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                My Deliverables & Tasks
              </h3>
              <button onClick={() => navigate('/tasks')} className="text-xs text-blue-400 hover:underline font-semibold">
                Manage All Tasks →
              </button>
            </div>

            {assignedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No tasks currently assigned to you.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                      <th className="py-2.5 px-3">Task #</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Progress</th>
                      <th className="py-2.5 px-3">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {assignedTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="py-3 px-3 font-mono font-bold text-blue-400">{t.taskNumber}</td>
                        <td className="py-3 px-3 font-medium text-white">{t.title}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            t.status === 'COMPLETED' || t.status === 'DONE' || t.status === 'Completed' || t.status === 'Done'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold">{t.progress}%</td>
                        <td className="py-3 px-3 text-slate-400">{t.dueDate || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notifications Panel */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
            <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              Notifications & Alerts
            </h3>
            <p className="text-xs text-slate-400 mb-4">Latest updates and system notices</p>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No notifications at this time.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notif, idx) => (
                  <div key={notif.id || idx} className="p-3 rounded-xl bg-[#131d38] border border-slate-800/80">
                    <p className="text-xs font-medium text-slate-200">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">{notif.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN DASHBOARD VIEW (Full System Overview & Executive Controls)
  // =========================================================================
  const shortcuts = [
    { label: 'Employee Management', path: '/employees', icon: Users, desc: 'Add, view & manage workforce profiles', color: 'from-blue-600/20 to-blue-500/10 border-blue-500/30' },
    { label: 'Project Management', path: '/projects', icon: Briefcase, desc: 'Portfolio status, budgets & initial task setup', color: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30' },
    { label: 'Task Management', path: '/tasks', icon: CheckSquare, desc: 'Track deliverables, assignments & progress', color: 'from-amber-600/20 to-amber-500/10 border-amber-500/30' },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, desc: 'Productivity & project health metrics', color: 'from-indigo-600/20 to-indigo-500/10 border-indigo-500/30' },
    { label: 'Activity Records', path: '/audit-logs', icon: History, desc: 'Audit trails & system activity records', color: 'from-rose-600/20 to-rose-500/10 border-rose-500/30' },
  ];

  const recentActivities = Array.isArray(stats?.recentActivities) ? stats.recentActivities : [];
  const departmentBreakdown = Array.isArray(stats?.departmentBreakdown) ? stats.departmentBreakdown : [];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121c38] via-[#101932] to-[#0f172a] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
              SYSTEM OPERATIONAL
            </span>
            <span className="text-xs text-slate-400 font-mono">Administrator Session</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Admin Overview & Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Welcome back, <span className="text-blue-400 font-semibold">{user?.firstName || user?.username || 'Admin'}</span>! Comprehensive workforce metrics, project performance, task tracking, and audit activities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {canManageEmployees && (
            <button
              onClick={onOpenNewEmployeeModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Employee</span>
            </button>
          )}

          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>

      {/* Admin Metric Cards Grid (6 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Employees */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Total Employees</p>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{stats?.totalEmployees ?? stats?.totalWorkforce ?? 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active workforce</p>
        </div>

        {/* Card 2: Total Projects */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Total Projects</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{stats?.totalProjects ?? 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">{stats?.activeProjects ?? 0} In Progress</p>
        </div>

        {/* Card 3: Total Tasks */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Total Tasks</p>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{stats?.totalTasksCount ?? 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">System deliverables</p>
        </div>

        {/* Card 4: Pending Tasks */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Pending Tasks</p>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{stats?.pendingTasks ?? 0}</p>
          <p className="text-[10px] text-amber-400 mt-1">{stats?.urgentTasks ?? 0} High Priority</p>
        </div>

        {/* Card 5: Completed Tasks */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Completed Tasks</p>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{stats?.completedTasksCount ?? 0}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Delivered successfully</p>
        </div>

        {/* Card 6: Task Completion Rate */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Completion Rate</p>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{stats?.taskCompletionRate ?? 0}%</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${stats?.taskCompletionRate ?? 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Shortcuts */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Admin Management Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.path}
                onClick={() => navigate(sc.path)}
                className={`p-4 rounded-xl bg-gradient-to-br ${sc.color} border hover:border-slate-600 transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{sc.label}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sc.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Grid: Recent Activities & Employee Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Progress */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Active Projects Progress
              </h3>
              <p className="text-xs text-slate-400">Current progress calculated from linked deliverables</p>
            </div>
            <button onClick={() => navigate('/projects')} className="text-xs text-blue-400 hover:underline font-semibold">
              View All Projects →
            </button>
          </div>

          <div className="space-y-4">
            {(stats?.activeProjectsList || stats?.activeProjectsOverview || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No projects in database. Click "Project Management" to create one.</p>
            ) : (
              (stats?.activeProjectsList || stats?.activeProjectsOverview || []).map((prj, index) => (
                <div key={prj.id || `prj-${index}`} className="p-3.5 rounded-xl bg-[#131d38] border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-blue-400 rounded border border-slate-700">
                        {prj.code}
                      </span>
                      <h4 className="font-semibold text-xs text-white">{prj.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-blue-400">{prj.progress || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${prj.progress || 0}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dept: <strong className="text-slate-300">{prj.department || 'General'}</strong></span>
                    <span>Tasks: <strong className="text-emerald-400">{prj.completedTasks ?? 0}/{prj.totalTasks ?? 0} Done</strong></span>
                    <span>Deadline: <strong className="text-amber-300">{prj.deadline || '2026-12-31'}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employee Statistics & Department Breakdown */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-md">
          <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            Employee Statistics
          </h3>
          <p className="text-xs text-slate-400 mb-4">Department distribution</p>

          {departmentBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No employee records found.</p>
          ) : (
            <div className="space-y-3">
              {departmentBreakdown.map((dept, index) => (
                <div key={dept.name || index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{dept.name}</span>
                    <span className="text-slate-400 font-mono">{dept.count} Staff ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.max(dept.percentage || 0, 5)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activities Section */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-xs text-white mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Recent Activities
            </h4>
            {recentActivities.length === 0 ? (
              <p className="text-[11px] text-slate-500">No activity logs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentActivities.slice(0, 4).map((act, i) => (
                  <div key={act.id || i} className="text-[11px] p-2 rounded-lg bg-[#131d38] border border-slate-800">
                    <p className="text-slate-300 font-medium line-clamp-1">{act.details || act.action}</p>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>{act.performedBy || 'System'}</span>
                      <span>{act.timestamp || 'Recent'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
