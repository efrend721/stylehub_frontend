import { useEffect } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  Switch,
  CircularProgress,
  Paper
} from '@mui/material';
import MainCard from '#/ui-component/cards/MainCard';
import { MenuTree } from './components';
import { useRoleEdit } from './hooks/useRoleEdit';

// Árbol de menús ahora encapsulado en componentes: MenuTree + MenuTreeItem

const RoleEditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const roleId = (() => {
    // Nota: esta pantalla se renderiza desde un route dinámico (path: '*'),
    // por lo que `useParams()` no recibe params. Parseamos con matchPath.
    const m1 = matchPath({ path: '/admin/roles/editar/:id', end: true }, location.pathname);
    const m2 = matchPath({ path: '/admin/roles/editar/:id_rol', end: true }, location.pathname);
    const idStr = m1?.params?.id ?? m2?.params?.id_rol ?? location.pathname.split('/').filter(Boolean).pop();
    const n = idStr ? Number(idStr) : NaN;
    return Number.isFinite(n) ? n : undefined;
  })();
  const { loading, saving, error, role, menus, isDirty, handleRoleChange, handleMenuToggle, save } = useRoleEdit(roleId);

  useEffect(() => {
    if (error) {
      void navigate('/admin/roles');
    }
  }, [error, navigate]);

  const handleSave = async () => {
    await save();
    void navigate('/admin/roles');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!role) return null;

  return (
    <MainCard title={`Editar Rol: ${role.nombre}`}>
      <Grid container spacing={3}>
        {/* Columna Izquierda: Datos del Rol */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Datos Generales</Typography>
            <Stack spacing={3}>
              <TextField
                id="role-edit-nombre"
                name="nombre"
                label="Nombre del Rol"
                value={role.nombre}
                onChange={(e) => handleRoleChange('nombre', e.target.value)}
                fullWidth
                required
              />
              <TextField
                id="role-edit-descripcion"
                name="descripcion"
                label="Descripción"
                value={role.descripcion}
                onChange={(e) => handleRoleChange('descripcion', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="estado"
                    inputProps={{ id: 'role-edit-estado' }}
                    checked={role.estado === 1}
                    onChange={(e) => handleRoleChange('estado', e.target.checked ? 1 : 0)}
                    color="primary"
                  />
                }
                label={role.estado === 1 ? 'Activo' : 'Inactivo'}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Columna Derecha: Permisos (Menús) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Permisos de Menú</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Seleccione los menús a los que este rol tendrá acceso.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <MenuTree items={menus} onToggle={handleMenuToggle} />
          </Paper>
        </Grid>

        {/* Botones de Acción */}
        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={() => { void navigate('/admin/roles'); }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={() => { void handleSave(); }}
              disabled={saving || !isDirty}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default RoleEditPage;
