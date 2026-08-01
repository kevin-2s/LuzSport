import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SuperadminPage } from '../pages/superadmin/SuperadminPage';
import { UnauthorizedPage } from '../pages/unauthorized/UnauthorizedPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  // Protected paths for SUPERADMIN
  {
    element: <ProtectedRoute allowedRoles={['SUPERADMIN']} />,
    children: [
      {
        path: '/superadmin',
        element: <SuperadminPage />,
      },
    ],
  },
  // Protected paths for TIENDA users
  {
    element: <ProtectedRoute allowedRoles={['TIENDA']} />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  // Catch all redirects
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
