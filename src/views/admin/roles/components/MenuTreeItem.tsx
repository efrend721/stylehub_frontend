import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import type { RoleMenuItem } from '#/types/menu';

type Props = {
  item: RoleMenuItem;
  level?: number;
  onToggle: (id: number, checked: boolean) => void;
};

function getAggregateState(item: RoleMenuItem): { all: boolean; some: boolean } {
  const children = Array.isArray(item.children) ? item.children : [];
  if (children.length === 0) {
    const v = !!item.asignado;
    return { all: v, some: v };
  }

  const states = children.map(getAggregateState);
  const all = states.every((s) => s.all);
  const some = states.some((s) => s.some);

  // Si el backend marcó el nodo explícitamente como asignado, reflejarlo como "checked".
  if (item.asignado) return { all: true, some: true };

  return { all, some };
}

export function MenuTreeItem({ item, onToggle, level = 0 }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(item.id_menu_item, e.target.checked);
  };

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const agg = hasChildren ? getAggregateState(item) : { all: !!item.asignado, some: !!item.asignado };
  const checked = !!item.asignado || (hasChildren && agg.all);
  const indeterminate = hasChildren && !checked && agg.some;

  return (
    <Box sx={{ ml: level * 3, mb: 1 }}>
      <FormControlLabel
        control={<Checkbox checked={checked} indeterminate={indeterminate} onChange={handleChange} color="primary" />}
        label={
          <Typography variant={item.type === 'group' ? 'subtitle1' : 'body2'} sx={{ fontWeight: item.type === 'group' ? 'bold' : 'normal' }}>
            {item.title}
          </Typography>
        }
      />
      {item.children && item.children.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {item.children.map((child) => (
            <MenuTreeItem key={child.id_menu_item} item={child} onToggle={onToggle} level={level + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
}
