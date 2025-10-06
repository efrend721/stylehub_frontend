import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { DashboardPage } from '../../features/dashboard/pages/index.js';
import { LoginPage } from '../../features/auth/pages/index.js';

export const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/dashboard/*" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};