import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '#/contexts/JWTContext';
import Loader from '#/ui-component/Loader';
import { useMenuItems } from '#/hooks/useMenuItems';

// RoleGuard basado en permisos provenientes del backend (menús permitidos por rol)
// No requiere codificar reglas en el frontend; valida contra las URLs de menú permitidas.

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  let p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // quitar trailing slash (excepto para raíz)
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function flattenUrls(items: import('#/types/menu').UIMenuItem[]): string[] {
  const urls: string[] = [];
  const stack = [...items];
  while (stack.length) {
    const it = stack.pop()!;
    if (it.url) urls.push(normalizePath(it.url));
    if (it.children && it.children.length) stack.push(...it.children);
  }
  return urls;
}

// prefijo permitido: '/admin/roles' permite '/admin/roles/editar/123'
function isAllowed(pathname: string, allowed: string[]): boolean {
  const target = normalizePath(pathname);
  // coincidencia exacta
  if (allowed.includes(target)) return true;
  // coincidencia por prefijo con límite de segmento
  for (const base of allowed) {
    if (base === '/') continue;
    if (target === base) return true;
    if (target.startsWith(base + '/')) return true;
  }
  return false;
}

export default function RoleGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { items, loading } = useMenuItems();
  const location = useLocation();

  // useMemo debe llamarse siempre (antes de cualquier return)
  const allowedUrls = useMemo(() => flattenUrls(items), [items]);

  // Mientras carga auth o menús, mostrar loader
  if (isLoading || loading) return <Loader />;

  // Si no autenticado, redirigir a login
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const canAccess = isAllowed(location.pathname, allowedUrls);

  if (!canAccess) {
    // Redirigir a una página segura (dashboard por defecto)
    // Nota: si deseas una página 403, podemos mostrar un componente dedicado.
    return <Navigate to="/dashboard/default" replace />;
  }

  // Renderizar rutas hijas dentro del guard
  return <Outlet />;
}
