// Centralized icon map for backend-provided icon keys
// Maps string keys (e.g., "IconTypography") to @tabler/icons-react components

import React from 'react';
import {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  IconDashboard,
  IconFiles,
  IconBrandChrome,
  IconHelp,
  IconUsers,
  IconShield,
  IconKey,
  IconLayoutSidebar,
  IconRoute,
  IconSettings,
  IconActivity,
  IconReport,
  IconArrowRight,
  IconShoppingCart,
  IconTruck
} from '@tabler/icons-react';

// Extend this map as new icon keys appear from backend
export const iconMap = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  IconDashboard,
  IconFiles,
  IconBrandChrome,
  IconHelp,
  IconUsers,
  IconShield,
  IconKey,
  IconLayoutSidebar,
  IconRoute,
  IconSettings,
  IconActivity,
  IconReport,
  IconArrowRight
  ,IconShoppingCart
  ,IconTruck
} as const;

export type IconKey = keyof typeof iconMap;
// Use the concrete type of a Tabler icon component to avoid `any`.
export type IconComponent = typeof IconWindmill;

// Mapping from backend icon keys to Berry CSS class names
const iconKeyToCSSName: Record<string, string> = {
  IconDashboard: 'dashboard',
  IconTypography: 'typography',
  IconHelp: 'help',
  IconShadow: 'shadow',
  IconPalette: 'palette',
  IconUsers: 'users',
  IconShield: 'shield',
  IconKey: 'key',
  IconLayoutSidebar: 'layout-sidebar',
  IconSettings: 'settings',
  IconActivity: 'activity',
  IconReport: 'report',
  IconFiles: 'files',
  IconBrandChrome: 'brand-chrome',
  IconRoute: 'route',
  IconWindmill: 'windmill',
  IconArrowRight: 'keyboard-arrow-right-outlined'
  ,IconShoppingCart: 'shopping-cart'
  ,IconTruck: 'truck'
};

// Fallback to a neutral icon if key unknown or absent
export function getIcon(iconKey?: string | null): IconComponent {
  if (!iconKey) {
    return createWrappedIcon(IconWindmill, 'windmill');
  }

  // Narrow key at runtime; fall back to default icon if not found
  if (iconKey in iconMap) {
    const IconComp = iconMap[iconKey as IconKey];
    const cssName = iconKeyToCSSName[iconKey] || 'windmill';
    return createWrappedIcon(IconComp, cssName);
  }
  return createWrappedIcon(IconWindmill, 'windmill');
}

// Helper function to create wrapped icon with Berry CSS classes
function createWrappedIcon(IconComp: IconComponent, cssName: string): IconComponent {
  const WrappedIcon = (props: React.ComponentProps<IconComponent>) => {
    return React.createElement(IconComp, {
      ...props,
      className: `tabler-icon tabler-icon-${cssName} ${props.className || ''}`.trim(),
      stroke: 'currentColor'
    });
  };

  WrappedIcon.displayName = `Wrapped${IconComp.displayName || IconComp.name || 'Icon'}`;
  
  return WrappedIcon as IconComponent;
}

// Suggest icon for group menu titles when backend does not provide a good unique icon
export function getGroupIconByTitle(title?: string | null): IconComponent {
  const t = (title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Common Spanish titles mapping
  if (t.includes('dashboard') || t.includes('panel')) return createWrappedIcon(IconDashboard, 'dashboard');
  if (t.includes('venta')) return createWrappedIcon(IconShoppingCart, 'shopping-cart');
  if (t.includes('gestion de usuario') || t.includes('usuarios')) return createWrappedIcon(IconUsers, 'users');
  if (t.includes('auditoria')) return createWrappedIcon(IconReport, 'report');
  if (t.includes('configuracion') || t.includes('sistema') || t.includes('ajustes')) return createWrappedIcon(IconSettings, 'settings');
  if (t.includes('logistica') || t.includes('envio') || t.includes('transporte')) return createWrappedIcon(IconTruck, 'truck');
  if (t.includes('gestion')) return createWrappedIcon(IconActivity, 'activity');
  // Fallback neutral icon
  return createWrappedIcon(IconWindmill, 'windmill');
}
