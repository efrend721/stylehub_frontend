import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import type { RoleMenuItem } from '#/types/menu';

type Props = {
  item: RoleMenuItem;
  level?: number;
  onToggle: (id: number, checked: boolean) => void;
};

export function MenuTreeItem({ item, onToggle, level = 0 }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(item.id_menu_item, e.target.checked);
  };

  return (
    <Box sx={{ ml: level * 3, mb: 1 }}>
      <FormControlLabel
        control={<Checkbox checked={!!item.asignado} onChange={handleChange} color="primary" />}
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
