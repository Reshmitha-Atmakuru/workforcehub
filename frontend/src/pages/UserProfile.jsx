import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Shield, Building, Mail, Calendar, Key } from 'lucide-react';

export default function UserProfile() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-lg ring-4 ring-blue-500/30">
          {user?.firstName?.[0] || user?.username?.[0] || 'U'}
        </div>
        <div>
          <h1 className="text-xl font-black text-white">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs text-slate-400">@{user?.username} • {user?.email}</p>
          <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
        <h2 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3">
          Account Profile Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Department</span>
            <p className="font-bold text-white text-sm">{user?.department || 'Management'}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">System Permission Level</span>
            <p className="font-bold text-emerald-400 text-sm">
              {isAdmin ? 'Full Administrator Access (ROLE_ADMIN)' : 'Standard Employee Access (ROLE_EMPLOYEE)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
