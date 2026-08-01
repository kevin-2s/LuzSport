import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

interface ProtectedRouteProps {
  allowedRoles?: ('SUPERADMIN' | 'TIENDA')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSessionStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
