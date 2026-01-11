import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import type { Usuario } from './types';

interface Props {
  items: Usuario[];
  onEdit: (item: Usuario) => void;
  onAskDelete: (id: string) => void;
}

export default function UsuariosList({ items, onEdit, onAskDelete }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<Usuario | null>(null);

  const openMenuFor = (el: HTMLElement, row: Usuario) => {
    setMenuAnchor(el);
    setMenuRow(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  return (
    <Stack spacing={1.5}>
      {items.map((row) => {
        const title = `${row.nombre_usuario} ${row.apellido_usuario}`.trim() || row.usuario_acceso;
        const subtitle = row.correo_electronico || row.usuario_acceso;
        const isActive = row.estado === 1;

        return (
          <Paper
            key={row.usuario_acceso}
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
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {subtitle}
                </Typography>
              </Box>

              <Chip
                label={isActive ? 'Activo' : 'Inactivo'}
                color={isActive ? 'success' : 'default'}
                size="small"
                sx={{ mr: 0.5 }}
              />
              <IconButton size="small" onClick={(e) => openMenuFor(e.currentTarget, row)}>
                <IconDotsVertical size={20} />
              </IconButton>
            </Stack>
          </Paper>
        );
      })}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) onEdit(menuRow);
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
            if (menuRow) onAskDelete(menuRow.usuario_acceso);
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
