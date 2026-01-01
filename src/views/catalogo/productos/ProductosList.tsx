import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { IconDotsVertical } from '@tabler/icons-react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import type { Producto } from './types';

interface Props {
  items: Producto[];
  onEdit: (item: Producto) => void;
  onAskDelete: (id: number) => void;
}

export default function ProductosList({ items, onEdit, onAskDelete }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<Producto | null>(null);

  const openMenuFor = (el: HTMLElement, row: Producto) => {
    setMenuAnchor(el);
    setMenuRow(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  return (
    <Stack spacing={1.5}>
      {items.map((row) => (
        <Paper
          key={row.id_producto}
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
                {row.nombre_producto}
              </Typography>
              {row.descripcion && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {row.descripcion}
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={(e) => openMenuFor(e.currentTarget, row)}>
              <IconDotsVertical size={20} />
            </IconButton>
          </Stack>
        </Paper>
      ))}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        <MenuItem onClick={() => { if (menuRow) onEdit(menuRow); closeMenu(); }}>
          <ListItemIcon><IconEdit size={18} /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (menuRow) onAskDelete(menuRow.id_producto); closeMenu(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><IconTrash size={18} /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
