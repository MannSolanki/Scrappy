import React from 'react';
<<<<<<< HEAD
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'buyer' | 'seller';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <Navigate
                to={user?.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard'}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
=======
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
>>>>>>> scrappy
