import { useEffect, useState } from 'react';
import { getIcon, getGroupIconByTitle } from '#/menu-items/iconMap';
import type { BackendMenuItem, UIMenuItem } from '#/types/menu';
import { useAuth } from '#/contexts/JWTContext';
import { MenusService } from '#/services';
import useConfig from '#/hooks/useConfig';

type Source = 'api' | 'static';

type HookState = {
  items: UIMenuItem[];
  loading: boolean;
  error: string | null;
  source: Source;
};

// API helpers centralizados en services

function toBool(v: unknown, def = false): boolean {
  if (v === true || v === 1 || v === '1') return true;
  if (v === false || v === 0 || v === '0') return false;
  return def;
}

function isNavVisible(v: unknown): boolean {
  // Por defecto visible, a menos que el backend marque explícitamente false/0
  return toBool(v, true);
}

function pruneForSidebar(items: BackendMenuItem[]): BackendMenuItem[] {
  const arr = Array.isArray(items) ? items : [];
  const out: BackendMenuItem[] = [];

  for (const it of arr) {
    if (!it) continue;
    if (it.nav_visible != null && !isNavVisible(it.nav_visible)) continue;

    const children = it.children ? pruneForSidebar(it.children) : undefined;
    const next: BackendMenuItem = { ...it, ...(children ? { children } : {}) };

    // deny-by-default UI: no mostrar grupos/collapses sin hijos y sin url
    const hasUrl = typeof next.url === 'string' && next.url.trim().length > 0;
    const hasChildren = Array.isArray(next.children) && next.children.length > 0;

    if ((next.type === 'group' || next.type === 'collapse') && !hasChildren && !hasUrl) {
      continue;
    }

    out.push(next);
  }

  return out;
}

function inflate(item: BackendMenuItem, overrideGroupIcons: boolean): UIMenuItem {
  // Resolve icon: respect backend-provided icon when present; only override for groups without icon
  let resolvedIcon: UIMenuItem['icon'];
  if (item.type === 'group') {
    if (item.icon) {
      resolvedIcon = getIcon(item.icon);
    } else if (overrideGroupIcons) {
      resolvedIcon = getGroupIconByTitle(item.title ?? undefined);
    } else {
      resolvedIcon = getIcon(undefined);
    }
  } else {
    resolvedIcon = getIcon(item.icon ?? undefined);
  }

  const rawId = (item as BackendMenuItem & { id_key?: unknown }).id_key ?? item.id;
  const stableId = typeof rawId === 'string' ? rawId.trim() : String(rawId ?? '').trim();

  const uiItem: UIMenuItem = {
    id: stableId,
    title: item.title,
    type: item.type,
    icon: resolvedIcon,
    caption: item.caption ?? null,
    url: item.url ?? null,
    breadcrumbs: toBool(item.breadcrumbs, false),
    external: toBool(item.external, false),
    target_blank: toBool(item.target_blank, false),
    children: item.children?.map((child) => inflate(child, overrideGroupIcons))
  };

  // Add accordion functionality for groups with children
  if (item.type === 'group' && item.children && item.children.length > 0) {
    uiItem.isExpanded = false; // Default closed
  }

  return uiItem;
}

export function useMenuItems(): HookState {
  const { token } = useAuth();
  const { state: cfg } = useConfig();

  const [menuState, setMenuState] = useState<HookState>({
    items: [],
    loading: true,
    error: null,
    source: 'static'
  });

  // headers manejados en servicio

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setMenuState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await MenusService.getMenus();
        const rawItems = pruneForSidebar(Array.isArray(data) ? data : []);
        const items = rawItems.map((i) => inflate(i, cfg.customGroupIcons ?? true));
        if (!cancelled) {
          setMenuState({ items, loading: false, error: null, source: 'api' });
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
          setMenuState({ items, loading: false, error: msg, source: 'static' });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, cfg.customGroupIcons]);

  return menuState;
}

export default useMenuItems;
