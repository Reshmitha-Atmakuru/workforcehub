import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  Users,
  Briefcase,
  CheckSquare,
  Kanban,
  BarChart3,
  History,
  User,
  Plus
} from 'lucide-react';

export default function Sidebar({ onOpenNewEmployeeModal }) {
  const { isAdmin, isEmployee, canManageEmployees, canViewReports, canViewAuditLogs } = useAuth();

  const allNavItems = [
    { label: isAdmin ? 'Admin Dashboard' : 'My Dashboard', path: '/dashboard', icon: LayoutGrid, visible: true },
    { label: 'Employee Management', path: '/employees', icon: Users, visible: canManageEmployees },
    { label: isAdmin ? 'Project Management' : 'My Projects', path: '/projects', icon: Briefcase, visible: true },
    { label: isAdmin ? 'Task Management' : 'My Tasks', path: '/tasks', icon: CheckSquare, visible: true },
    { label: 'Kanban Board', path: '/kanban', icon: Kanban, pill: 'Workflow', visible: isEmployee },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, visible: canViewReports },
    { label: 'Activity Records', path: '/audit-logs', icon: History, visible: canViewAuditLogs },
  ];

  const navItems = allNavItems.filter((item) => item.visible);

  return (
    <aside className="w-64 bg-[#0b1329] border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Quick Action Button (Admin / HR) */}
        {canManageEmployees && (
          <button
            onClick={onOpenNewEmployeeModal}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Employee</span>
          </button>
        )}

        {/* Navigation Group */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">MAIN NAVIGATION</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold shadow-inner'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.pill && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-md uppercase">
                      {item.pill}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Account Group */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">ACCOUNT</p>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>User Profile</span>
          </NavLink>
        </div>
      </div>

      {/* Footer Branding Card */}
      <div className="mt-8 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-[11px]">
        <p className="font-semibold text-slate-300">Workforce Enterprise</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Human Resources & Operations Hub</p>
      </div>
    </aside>
  );
}
