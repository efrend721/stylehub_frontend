import { useMemo } from 'react';
import { Navigate, Outlet, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '#/contexts/JWTContext';
import Loader from '#/ui-component/Loader';
import { useAllowedRoutes } from '#/hooks/useAllowedRoutes';

// RoleGuard basado en permisos provenientes del backend (menús permitidos por rol)
// No requiere codificar reglas en el frontend; valida contra las URLs de menú permitidas.

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  let p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // quitar trailing slash (excepto para raíz)
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

// Deny-by-default: solo lo declarado en /menus/routes es permitido.
// Soporta parámetros tipo '/admin/roles/editar/:id'.
function isAllowed(pathname: string, allowedPatterns: string[]): boolean {
  const target = normalizePath(pathname);
  return allowedPatterns.some((pattern) => {
    const p = normalizePath(pattern);
    return Boolean(matchPath({ path: p, end: true }, target));
  });
}

export default function RoleGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { routes, loading } = useAllowedRoutes();
  const location = useLocation();

  // useMemo debe llamarse siempre (antes de cualquier return)
  const allowedPatterns = useMemo(() => routes.map((r) => r.url), [routes]);

  // Mientras carga auth o menús, mostrar loader
  if (isLoading || loading) return <Loader />;

  // Si no autenticado, redirigir a login
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const canAccess = isAllowed(location.pathname, allowedPatterns);

  if (!canAccess) {
    return <Navigate to="/403" replace />;
  }

  // Renderizar rutas hijas dentro del guard
  return <Outlet />;
}
