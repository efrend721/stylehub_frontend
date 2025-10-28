import { Navigate } from 'react-router-dom';
import { useAuth } from '#/contexts/AuthContext';
import Loader from '#/ui-component/Loader';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading) {
    return <Loader />;
  }

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard/default" replace />;
  }

  // Si no está autenticado, mostrar el contenido (login/register)
  return <>{children}</>;
};

export default PublicRoute;
