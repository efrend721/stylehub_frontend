// Types for menu structures (backend response and UI-consumable)

export type BackendMenuItem = {
  id: string;
  title: string | null;
  type: 'group' | 'item' | 'collapse';
  icon?: string | null;
  caption?: string | null;
  url?: string | null;
  breadcrumbs?: boolean | 0 | 1 | null;
  external?: boolean | 0 | 1 | null;
  target_blank?: boolean | 0 | 1 | null;
  children?: BackendMenuItem[];
};

export type UIMenuItem = {
  id: string;
  title: string | null;
  type: 'group' | 'item' | 'collapse';
  icon?: any; // Component reference (Tabler Icon component)
  caption?: string | null;
  url?: string | null;
  breadcrumbs?: boolean;
  external?: boolean;
  target_blank?: boolean;
  children?: UIMenuItem[];
};

export type UIMenuRoot = {
  items: UIMenuItem[];
};
