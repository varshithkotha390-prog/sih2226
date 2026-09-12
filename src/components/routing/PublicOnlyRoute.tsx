import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    if (role === 'recycler') {
      return <Navigate to="/recycler-dashboard" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
