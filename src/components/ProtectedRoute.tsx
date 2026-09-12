import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LoadingState } from './LoadingState';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  // 1. Unauthenticated users are redirected to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-based check: Redirect to user's assigned dashboard if accessing an unauthorized route
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (role === 'recycler') {
      return <Navigate to="/recycler-dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
