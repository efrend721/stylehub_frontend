import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import type { Proveedor } from './types';

interface ProveedoresListProps {
  items: Proveedor[];
  onEdit: (item: Proveedor) => void;
  onAskDelete: (id: number) => void;
}

export default function ProveedoresList({ items, onEdit, onAskDelete }: ProveedoresListProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<Proveedor | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: Proveedor) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Paper
          key={item.id_proveedor}
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
          elevation={0}
          variant="outlined"
        >
          <Stack direction="column" sx={{ flexGrow: 1, px: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {item.nombre_proveedor}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.representante ? `Rep: ${item.representante}` : 'Sin representante'} • {item.telefono || 'Sin teléfono'}
            </Typography>
          </Stack>

          <IconButton onClick={(e) => handleOpenMenu(e, item)} size="small">
            <IconDotsVertical size={20} />
          </IconButton>
        </Paper>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { if (menuItem) onEdit(menuItem); handleCloseMenu(); }}>
          <ListItemIcon><IconEdit size={18} /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (menuItem) onAskDelete(menuItem.id_proveedor); handleCloseMenu(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><IconTrash size={18} /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
