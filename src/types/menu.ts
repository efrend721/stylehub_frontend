// Types for menu structures (backend response and UI-consumable)
import type { IconComponent } from '#/menu-items/iconMap';

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
  icon?: IconComponent; // Component reference (Tabler Icon component)
  caption?: string | null;
  url?: string | null;
  breadcrumbs?: boolean;
  external?: boolean;
  target_blank?: boolean;
  children?: UIMenuItem[];
  isExpanded?: boolean; // For accordion functionality
  // Additional properties used in NavItem
  link?: string;
  target?: boolean;
  disabled?: boolean;
  chip?: {
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    variant?: 'filled' | 'outlined';
    size?: 'small' | 'medium';
    label?: string;
    avatar?: string;
  };
};

export type UIMenuRoot = {
  items: UIMenuItem[];
};
