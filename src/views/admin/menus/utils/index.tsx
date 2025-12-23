import { type ReactElement } from 'react';
import { IconDashboard, IconTypography, IconPalette, IconShadow, IconHelp, IconUsers, IconShield, IconLayoutSidebar, IconSettings, IconActivity, IconReport } from '@tabler/icons-react';
import { type MenuTreeNodeLocal } from '#/views/admin/menus/types';

export function renderIconPreview(name: string): ReactElement | null {
  const common = { size: 18 } as const;
  switch (name) {
    case 'IconDashboard': return <IconDashboard {...common} />;
    case 'IconTypography': return <IconTypography {...common} />;
    case 'IconPalette': return <IconPalette {...common} />;
    case 'IconShadow': return <IconShadow {...common} />;
    case 'IconHelp': return <IconHelp {...common} />;
    case 'IconUsers': return <IconUsers {...common} />;
    case 'IconShield': return <IconShield {...common} />;
    case 'IconLayoutSidebar': return <IconLayoutSidebar {...common} />;
    case 'IconSettings': return <IconSettings {...common} />;
    case 'IconActivity': return <IconActivity {...common} />;
    case 'IconReport': return <IconReport {...common} />;
    default: return null;
  }
}

export function buildTituloById(tree: ReadonlyArray<MenuTreeNodeLocal> | null | undefined): Record<number, string> {
  const map: Record<number, string> = {};
  const walk = (nodes?: ReadonlyArray<MenuTreeNodeLocal>) => {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((n: MenuTreeNodeLocal) => {
      if (typeof n.id_menu_item === 'number' && typeof n.titulo === 'string') {
        map[n.id_menu_item] = n.titulo;
      }
      if (Array.isArray(n.children) && n.children.length) walk(n.children as ReadonlyArray<MenuTreeNodeLocal>);
    });
  };
  walk(tree ?? undefined);
  return map;
}
