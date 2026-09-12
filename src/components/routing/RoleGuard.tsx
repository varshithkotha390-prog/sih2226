import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to the default screen for their actual role
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
