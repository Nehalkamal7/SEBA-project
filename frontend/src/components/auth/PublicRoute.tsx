import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({ children, redirectTo = '/dashboard' }: PublicRouteProps) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

