import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { FileCode, Copy, Check } from 'lucide-react';

export default function SwaggerDocs() {
  const [swaggerData, setSwaggerData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    API.get('/swagger-docs').then((res) => setSwaggerData(res.data));
  }, []);

  const copySpecs = () => {
    navigator.clipboard.writeText(JSON.stringify(swaggerData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: 'POST', path: '/api/v1/auth/login', title: 'User Authentication', desc: 'Validates user credentials and initiates a secure session' },
    { method: 'POST', path: '/api/v1/auth/register', title: 'Account Registration', desc: 'Creates new user account with specified access privileges' },
    { method: 'GET', path: '/api/v1/employees', title: 'Employee Directory', desc: 'Get paginated employee list with department and role filters' },
    { method: 'POST', path: '/api/v1/employees', title: 'Create Employee', desc: 'Add new workforce member with salary, location, and skills' },
    { method: 'GET', path: '/api/v1/projects', title: 'List Projects', desc: 'Fetch project portfolio with status and budgets' },
    { method: 'POST', path: '/api/v1/tasks', title: 'Create & Assign Task', desc: 'Create deliverable task and assign to workforce member' },
    { method: 'GET', path: '/api/v1/dashboard/stats', title: 'Realtime Metrics', desc: 'Fetch aggregated workforce stats for control center' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-teal-400" />
            <span>Application Integration Specifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard endpoint specifications for system integrations.
          </p>
        </div>

        <button
          onClick={copySpecs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
          <span>{copied ? 'Copied Specs JSON' : 'Copy Specifications'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3 mb-1.5">
              <span
                className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                  ep.method === 'GET'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {ep.method}
              </span>
              <span className="font-mono text-xs font-bold text-white">{ep.path}</span>
            </div>
            <h3 className="font-bold text-xs text-slate-200">{ep.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{ep.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
