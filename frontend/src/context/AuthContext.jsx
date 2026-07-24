import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('workforce_user');
    if (!savedUser || savedUser === 'undefined') return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('workforce_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('workforce_jwt_token');
    if (token) {
      API.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('workforce_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('workforce_jwt_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('workforce_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('workforce_jwt_token');
    localStorage.removeItem('token');
    localStorage.removeItem('workforce_user');
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const newUserData = { ...prev, ...updatedUserData };
      localStorage.setItem('workforce_user', JSON.stringify(newUserData));
      return newUserData;
    });
  };

  const userRole = user?.role || 'ROLE_EMPLOYEE';
  const isAdmin = userRole === 'ROLE_ADMIN';
  const isManager = userRole === 'ROLE_MANAGER';
  const isHR = userRole === 'ROLE_HR';
  const isFinance = userRole === 'ROLE_FINANCE';
  const isEmployee = userRole === 'ROLE_EMPLOYEE';

  const canManageEmployees = isAdmin;
  const canManageProjects = isAdmin || isManager;
  const canManageTasks = isAdmin || isManager;
  const canViewReports = isAdmin || isHR || isFinance || isManager;
  const canViewAuditLogs = isAdmin || isManager || isHR;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
        userRole,
        isAdmin,
        isManager,
        isHR,
        isFinance,
        isEmployee,
        canManageEmployees,
        canManageProjects,
        canManageTasks,
        canViewReports,
        canViewAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
