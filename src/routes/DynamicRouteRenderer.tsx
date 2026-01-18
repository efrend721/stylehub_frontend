import { useMemo } from 'react';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import Loader from '#/ui-component/Loader';
import { useAllowedRoutes } from '#/hooks/useAllowedRoutes';
import { getRouteElementByKey } from './routeComponentRegistry';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  let p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

export default function DynamicRouteRenderer() {
  const location = useLocation();
  const { routes, loading } = useAllowedRoutes();

  const match = useMemo(() => {
    const target = normalizePath(location.pathname);
    for (const r of routes) {
      const pattern = normalizePath(r.url);
      if (matchPath({ path: pattern, end: true }, target)) {
        return r;
      }
    }
    return null;
  }, [location.pathname, routes]);

  if (loading) return <Loader />;

  // si no está declarado, deny-by-default
  if (!match) {
    return <Navigate to="/403" replace />;
  }

  const element = getRouteElementByKey(match.id);
  if (!element) {
    // Ruta declarada pero aún no implementada en el registry.
    // No mostramos algo “mágico”; mejor fallback seguro.
    return <Navigate to="/dashboard/default" replace />;
  }

  return element;
}
