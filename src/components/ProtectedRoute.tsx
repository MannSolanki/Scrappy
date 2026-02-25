import React from 'react';
import { Navigate } from 'react-router-dom';

type UserRole = 'admin' | 'user' | 'pickup_partner';

type StoredUser = {
  name?: string;
  email?: string;
  role?: string;
  token?: string;
};

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return null;
    }
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return null;
  }
};

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (token) {
    return true;
  }

  const user = getStoredUser();
  return Boolean(user?.token);
};

const getUserRole = (): UserRole | null => {
  const user = getStoredUser();
  const normalizedRole = String(user?.role || '').trim().toLowerCase();
  if (normalizedRole === 'admin' || normalizedRole === 'user' || normalizedRole === 'pickup_partner') {
    return normalizedRole;
  }
  return null;
};

function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/home',
}: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getUserRole();
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
export { getUserRole, isAuthenticated };
