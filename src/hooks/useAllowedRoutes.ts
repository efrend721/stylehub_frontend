import { useEffect, useMemo, useState } from 'react';
import type { BackendMenuItem } from '#/types/menu';
import { MenusService } from '#/services';
import { useAuth } from '#/contexts/JWTContext';
import { getRoleIds } from '#/utils/auth/roleUtils';

function toBool(v: unknown, def = false): boolean {
  if (v === true || v === 1 || v === '1') return true;
  if (v === false || v === 0 || v === '0') return false;
  return def;
}

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  let p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

export type AllowedRoute = {
  id: string;
  url: string;
};

type HookState = {
  routes: AllowedRoute[];
  loading: boolean;
  error: string | null;
  source: 'api' | 'cache' | 'empty';
};

const ROUTES_CACHE_KEY = 'routes_cache_v1';

function extractAllowedRoutes(items: BackendMenuItem[]): AllowedRoute[] {
  return (Array.isArray(items) ? items : [])
    .filter((it) => typeof it?.url === 'string' && it.url)
    .filter((it) => {
      const url = String(it.url);
      const isExternal = toBool(it.external, false);
      return !isExternal && url.startsWith('/');
    })
    .map((it) => ({ id: it.id, url: normalizePath(String(it.url)) }));
}

export function useAllowedRoutes(): HookState {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<HookState>({ routes: [], loading: true, error: null, source: 'empty' });

  const rolesKey = useMemo(() => getRoleIds(user).sort((a, b) => a - b).join(','), [user]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await MenusService.getRoutes();
        const routes = extractAllowedRoutes(data);

        if (!cancelled) {
          setState({ routes, loading: false, error: null, source: 'api' });
          try {
            localStorage.setItem(ROUTES_CACHE_KEY, JSON.stringify(routes));
          } catch {}
        }
      } catch (err: unknown) {
        const status = err instanceof Error ? (err as { status?: number }).status : undefined;
        const errSource = err instanceof Error ? (err as { source?: unknown }).source : undefined;

        // PBAC: si el backend marca source='routes' es bloqueo a nivel aplicación.
        // No debemos usar cache ni intentar renderizar con allowlist vacía.
        if (status === 403 && errSource === 'routes') {
          try {
            localStorage.removeItem(ROUTES_CACHE_KEY);
          } catch {}

          if (!cancelled) {
            const msg = err instanceof Error ? err.message : 'No tienes permisos para acceder a esta aplicación';
            setState({ routes: [], loading: false, error: msg, source: 'empty' });
          }
          return;
        }

        let routes: AllowedRoute[] = [];
        try {
          const cached = localStorage.getItem(ROUTES_CACHE_KEY);
          if (cached) {
            const parsed: unknown = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              routes = (parsed as AllowedRoute[]).filter(
                (r) => r && typeof r.id === 'string' && typeof r.url === 'string'
              );
            }
          }
        } catch {}

        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Routes load failed';
          setState({ routes, loading: false, error: msg, source: routes.length ? 'cache' : 'empty' });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id_usuario_uuid, rolesKey]);

  return state;
}

export default useAllowedRoutes;
