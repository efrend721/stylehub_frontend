import { useEffect, useMemo, useState } from 'react';
import { getIcon } from '#/menu-items/iconMap';
import type { BackendMenuItem, UIMenuItem } from '#/types/menu';
import { useAuth } from '#/contexts/JWTContext';

type Source = 'api' | 'static';

type HookState = {
  items: UIMenuItem[];
  loading: boolean;
  error: string | null;
  source: Source;
};

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === 'boolean';
}

function toBool(v: unknown, def = false): boolean {
  if (v === true || v === 1 || v === '1') return true;
  if (v === false || v === 0 || v === '0') return false;
  return def;
}

function inflate(item: BackendMenuItem): UIMenuItem {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    icon: getIcon(item.icon ?? undefined),
    caption: item.caption ?? null,
    url: item.url ?? null,
    breadcrumbs: toBool(item.breadcrumbs, false),
    external: toBool(item.external, false),
    target_blank: toBool(item.target_blank, false),
    children: item.children?.map(inflate)
  };
}

export function useMenuItems(): HookState {
  const { token } = useAuth();

  const [state, setState] = useState<HookState>({
    items: [],
    loading: true,
    error: null,
    source: 'static'
  });

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await fetch(`${API_BASE}/menus`, { method: 'GET', headers });
        const raw: unknown = await res.json().catch(() => ({}));

        if (!res.ok || !isApiResponse<BackendMenuItem[]>(raw) || !raw.success) {
          const msg = isApiResponse<BackendMenuItem[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
          throw new Error(msg);
        }

        const data = Array.isArray(raw.data) ? raw.data : [];
        const items = data.map(inflate);
        if (!cancelled) {
          setState({ items, loading: false, error: null, source: 'api' });
          // cache optional
          try {
            localStorage.setItem('menu_cache', JSON.stringify(items));
          } catch {}
        }
      } catch (err: unknown) {
        // fallback: cached or empty
        let items: UIMenuItem[] = [];
        try {
          const cached = localStorage.getItem('menu_cache');
          if (cached) {
            const parsed: unknown = JSON.parse(cached);
            if (Array.isArray(parsed)) items = parsed as UIMenuItem[];
          }
        } catch {}

        if (!cancelled) {
          // Log minimal info to help diagnose without spamming UI
          if (import.meta.env.MODE !== 'production') {
            let msg: string;
            if (err instanceof Error) msg = err.message;
            else if (typeof err === 'string') msg = err;
            else {
              try {
                msg = JSON.stringify(err);
              } catch {
                msg = 'Unknown error';
              }
            }
            console.warn('[menu] Falling back to static menu:', msg);
          }
          const msg = err instanceof Error ? err.message : 'Menu load failed';
          setState({ items, loading: false, error: msg, source: 'static' });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, headers]);

  return state;
}

export default useMenuItems;
