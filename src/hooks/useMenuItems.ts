import { useEffect, useMemo, useState } from 'react';
import { getIcon } from 'menu-items/iconMap';
import type { BackendMenuItem, UIMenuItem } from 'types/menu';
import { useAuth } from 'contexts/JWTContext';

type Source = 'api' | 'static';

type HookState = {
  items: UIMenuItem[];
  loading: boolean;
  error: string | null;
  source: Source;
};

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

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
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || `HTTP ${res.status}`);
        }

        const data = Array.isArray(json.data) ? (json.data as BackendMenuItem[]) : [];
        const items = data.map(inflate);
        if (!cancelled) {
          setState({ items, loading: false, error: null, source: 'api' });
          // cache optional
          try {
            localStorage.setItem('menu_cache', JSON.stringify(items));
          } catch {}
        }
      } catch (err: any) {
        // fallback: cached or empty
        let items: UIMenuItem[] = [];
        try {
          const cached = localStorage.getItem('menu_cache');
          if (cached) items = JSON.parse(cached);
        } catch {}

        if (!cancelled) {
          // Log minimal info to help diagnose without spamming UI
          if (import.meta.env.MODE !== 'production') {
            console.warn('[menu] Falling back to static menu:', err?.message || err);
          }
          setState({ items, loading: false, error: err?.message || 'Menu load failed', source: 'static' });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, headers]);

  return state;
}

export default useMenuItems;
