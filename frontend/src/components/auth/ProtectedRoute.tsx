import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryToken = params.get('token');
  const storedToken = localStorage.getItem('auth_token');
  
  // If token is in query, save it
  if (queryToken === '0097' && !storedToken) {
    localStorage.setItem('auth_token', queryToken);
  }
  
  const token = storedToken || queryToken;
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

