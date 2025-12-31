import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { MoreVert } from '@mui/icons-material';
import { useState } from 'react';
import type { Producto } from './types';

interface Props {
  items: Producto[];
  onEdit: (item: Producto) => void;
  onAskDelete: (id: number) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
}

export default function ProductosList({ items, onEdit, onAskDelete, onReorder }: Props) {
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
    <Stack spacing={1.25} sx={{ my: 1 }}>
      {items.map((row) => (
        <Paper key={row.id_producto} variant="outlined" sx={{ px: 2, py: 1, borderRadius: '50px' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap>{row.nombre_producto}</Typography>
              {row.descripcion && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {row.descripcion}
                </Typography>
              )}
            </Box>
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
            <IconButton size="small" onClick={(e) => openMenuFor(e.currentTarget, row)}>
              <MoreVert />
            </IconButton>
          </Stack>
        </Paper>
      ))}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        <MenuItem onClick={() => { if (menuRow) onReorder(menuRow.id_producto, 'up'); closeMenu(); }}>Mover arriba</MenuItem>
        <MenuItem onClick={() => { if (menuRow) onReorder(menuRow.id_producto, 'down'); closeMenu(); }}>Mover abajo</MenuItem>
        <Divider />
        <MenuItem onClick={() => { if (menuRow) onEdit(menuRow); closeMenu(); }}>Editar</MenuItem>
        <MenuItem onClick={() => { if (menuRow) onAskDelete(menuRow.id_producto); closeMenu(); }} sx={{ color: 'error.main' }}>Eliminar</MenuItem>
      </Menu>
    </Stack>
  );
}
