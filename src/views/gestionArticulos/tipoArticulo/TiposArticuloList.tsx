import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import type { TipoArticulo } from './types';

interface Props {
  items: TipoArticulo[];
  onEdit: (item: TipoArticulo) => void;
  onAskDelete: (id: number) => void;
}

export function TiposArticuloList({ items, onEdit, onAskDelete }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem] = useState<TipoArticulo | null>(null);

  const openMenuFor = (el: HTMLElement, item: TipoArticulo) => {
    setMenuAnchor(el);
    setMenuItem(item);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuItem(null);
  };

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Paper
          key={item.id_tipo}
          elevation={0}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-2px)',
              boxShadow: 2
            }
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
            <Box sx={{ flexGrow: 1, overflow: 'hidden', minWidth: 0, px: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {item.nombre_tipo}
              </Typography>
            </Box>

            <IconButton size="small" onClick={(e) => openMenuFor(e.currentTarget, item)}>
              <IconDotsVertical size={20} />
            </IconButton>
          </Stack>
        </Paper>
      ))}

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (menuItem) onEdit(menuItem);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuItem) onAskDelete(menuItem.id_tipo);
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <IconTrash size={18} />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
