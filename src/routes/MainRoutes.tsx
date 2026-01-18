import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from '#/layout/MainLayout';
import AuthGuard from '#/utils/route-guard/AuthGuard';
import RoleGuard from '#/utils/route-guard/RoleGuard';
import ErrorBoundary from './ErrorBoundary';
import DynamicRouteRenderer from './DynamicRouteRenderer';

import { lazy } from 'react';
import Loadable from '#/ui-component/Loadable';

// errors
const ForbiddenPage = Loadable(lazy(() => import('#/views/errors/ForbiddenPage')));
// dashboard routing (safe default)
const DashboardDefault = Loadable(lazy(() => import('#/views/dashboard/Default')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  errorElement: <ErrorBoundary />,
  children: [
    // Safe fallback (siempre disponible después de autenticado)
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    // Hardcoded forbidden route (útil para futuro PBAC/dynamic routing)
    {
      path: '403',
      element: <ForbiddenPage />
    },
    // Protected routes (sólo accesible si el usuario tiene el rol/permiso adecuado)
    {
      element: <RoleGuard />,
      children: [
        // Dynamic protected routes:
        // Renderiza el componente según /menus/routes + registry local (id_key -> componente)
        {
          path: '*',
          element: <DynamicRouteRenderer />
        }
      ]
    },
    // Catch-all: si no existe la ruta (o aún no está en el JSON dinámico), volver al dashboard
    {
      path: '*',
      element: <Navigate to="/dashboard/default" replace />
    }
  ]
};

export default MainRoutes;
