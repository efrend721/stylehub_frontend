// Centralized icon map for backend-provided icon keys
// Maps string keys (e.g., "IconTypography") to @tabler/icons-react components

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
  IconReport
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
  IconReport
} as const;

export type IconKey = keyof typeof iconMap;

// Fallback to a neutral icon if key unknown or absent
export function getIcon(iconKey?: string | null) {
  if (!iconKey) return IconWindmill;
  return (iconMap as Record<string, any>)[iconKey] ?? IconWindmill;
}
