import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Bloqueia acesso ao /admin para não-admins
  if (location.pathname.startsWith('/admin') && usuario.tipo !== 'admin' && !usuario.email?.includes('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
