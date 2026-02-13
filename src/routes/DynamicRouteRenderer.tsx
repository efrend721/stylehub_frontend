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

function inferComponentKeyFromUrl(url: string): string | null {
  const u = normalizePath(url);
  if (u === '/dashboard/default') return 'dashboard-default';

  const last = u.split('/').filter(Boolean).pop() ?? '';
  if (!last) return null;

  switch (last) {
    case 'articulo':
    case 'articulos':
    case 'producto':
    case 'productos':
      return 'articulos';
    default:
      return last;
  }
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

  const element = getRouteElementByKey(String(match.id));
  if (!element) {
    // Ruta declarada pero el backend no entregó un id_key usable.
    // Fallback: inferir desde la URL para evitar rebote al dashboard.
    const inferredKey = inferComponentKeyFromUrl(match.url);
    const inferredElement = inferredKey ? getRouteElementByKey(inferredKey) : null;
    if (inferredElement) return inferredElement;

    // Ruta declarada pero aún no implementada en el registry.
    return <Navigate to="/dashboard/default" replace />;
  }

  return element;
}
