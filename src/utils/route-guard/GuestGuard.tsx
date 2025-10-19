import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/JWTContext';
import Loader from 'ui-component/Loader';

interface Props { children: React.ReactNode }

export default function GuestGuard({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/dashboard/default" replace />;
  return <>{children}</>;
}
