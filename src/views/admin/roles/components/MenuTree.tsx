import { Box } from '@mui/material';
import type { RoleMenuItem } from '#/types/menu';
import { MenuTreeItem } from './MenuTreeItem';

type Props = {
  items: RoleMenuItem[];
  onToggle: (id: number, checked: boolean) => void;
  maxHeight?: number | string;
};

export function MenuTree({ items, onToggle, maxHeight = '600px' }: Props) {
  return (
    <Box sx={{ maxHeight, overflowY: 'auto' }}>
      {items.map((menu) => (
        <MenuTreeItem key={menu.id_menu_item} item={menu} onToggle={onToggle} />
      ))}
    </Box>
  );
}
