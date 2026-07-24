import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Kanban from './pages/Kanban';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import SwaggerDocs from './pages/SwaggerDocs';
import ArchitectureFlowchart from './pages/ArchitectureFlowchart';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1329] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating user session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminOnlyRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function EmployeeOnlyRoute({ children }) {
  const { isEmployee, loading } = useAuth();

  if (loading) return null;

  if (!isEmployee) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ReportsRoute({ children }) {
  const { canViewReports, loading } = useAuth();
  if (loading) return null;
  if (!canViewReports) return <Navigate to="/dashboard" replace />;
  return children;
}

function AuditLogsRoute({ children }) {
  const { canViewAuditLogs, loading } = useAuth();
  if (loading) return null;
  if (!canViewAuditLogs) return <Navigate to="/dashboard" replace />;
  return children;
}

function MainLayout() {
  const { theme } = useTheme();
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenNewEmployeeModal = () => {
    navigate('/employees');
    setIsEmployeeModalOpen(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b1329] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Navbar />
      <div className="flex">
        <Sidebar onOpenNewEmployeeModal={handleOpenNewEmployeeModal} />
        <main className={`flex-1 p-6 md:p-8 overflow-y-auto w-full min-w-0 transition-colors duration-300`}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard onOpenNewEmployeeModal={handleOpenNewEmployeeModal} />} />
            <Route path="/employees" element={<AdminOnlyRoute><Employees isModalOpen={isEmployeeModalOpen} setIsModalOpen={setIsEmployeeModalOpen} /></AdminOnlyRoute>} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/kanban" element={<EmployeeOnlyRoute><Kanban /></EmployeeOnlyRoute>} />
            <Route path="/reports" element={<ReportsRoute><Reports /></ReportsRoute>} />
            <Route path="/audit-logs" element={<AuditLogsRoute><AuditLogs /></AuditLogsRoute>} />
            <Route path="/swagger" element={<SwaggerDocs />} />
            <Route path="/flowchart" element={<ArchitectureFlowchart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
