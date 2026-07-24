import React, { useState } from 'react';
import { GitFork, ShieldCheck, Database, Server, Laptop, CheckCircle2 } from 'lucide-react';

export default function ArchitectureFlowchart() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'User Interface Request',
      tech: 'Client Application & Request Handler',
      desc: 'User interacts with UI components. The system automatically attaches authorization tokens to outgoing requests.',
      icon: Laptop,
      color: 'border-blue-500 bg-blue-950/20 text-blue-400',
    },
    {
      step: 2,
      title: 'Security Verification & Authorization',
      tech: 'Security Engine & Session Validator',
      desc: 'Intercepts request, verifies authorization tokens, and extracts user privileges and role-based permissions.',
      icon: ShieldCheck,
      color: 'border-indigo-500 bg-indigo-950/20 text-indigo-400',
    },
    {
      step: 3,
      title: 'Business Logic Execution',
      tech: 'Service Layer & Operations Controller',
      desc: 'Routes payload to workforce, project, task, or analytics modules while enforcing access rules.',
      icon: Server,
      color: 'border-teal-500 bg-teal-950/20 text-teal-400',
    },
    {
      step: 4,
      title: 'Data Persistence Layer',
      tech: 'Repository & Database Engine',
      desc: 'Maps business domain objects to persistent data structures and handles transactional storage.',
      icon: Database,
      color: 'border-emerald-500 bg-emerald-950/20 text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitFork className="w-6 h-6 text-cyan-400" />
          <span>Workforce Management System Flowchart</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          System flowchart depicting user authorization, operational controllers, and persistent database storage.
        </p>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.step;
          return (
            <div
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-4 rounded-2xl border ${s.color} cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-blue-500 shadow-xl scale-102' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono text-white">
                  0{s.step}
                </span>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white mb-1">{s.title}</h3>
              <p className="text-[10px] text-slate-400">{s.tech}</p>
            </div>
          );
        })}
      </div>

      {/* Active Step Detailed Simulation Box */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>STAGE {activeStep}: {steps[activeStep - 1].title}</span>
        </div>

        <h2 className="text-lg font-bold text-white">{steps[activeStep - 1].title}</h2>
        <p className="text-xs text-slate-300 leading-relaxed">{steps[activeStep - 1].desc}</p>

        <div className="p-4 rounded-xl bg-[#131d38] border border-slate-800 font-mono text-xs text-blue-300">
          <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">FLOW LOG SIMULATION</p>
          <p>[{new Date().toISOString()}] Executing stage {activeStep} pipeline handler...</p>
          <p>Payload verified successfully against security context.</p>
        </div>
      </div>
    </div>
  );
}
