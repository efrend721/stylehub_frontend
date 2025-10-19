import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/JWTContext';
import Loader from 'ui-component/Loader';

interface Props { children: React.ReactNode }

export default function AuthGuard({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
