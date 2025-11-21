import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import type { UsuarioEdit } from './types';
import { useEstablecimientos } from './useEstablecimientos';
import { useRoles } from './useRoles';
import { useState, useEffect, useRef } from 'react';

type Props = {
  user: UsuarioEdit | null;
  saving: boolean;
  onClose: () => void;
  onChange: (user: UsuarioEdit) => void;
  onSave: () => void;
};

export function UsuariosEditDialog({ user, saving, onClose, onChange, onSave }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [editData, setEditData] = useState<UsuarioEdit | null>(null);
  const currentUserRef = useRef<string | null>(null);
  
  const { establecimientos, loading: loadingEst, error: errorEst } = useEstablecimientos();
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

  // Usar directamente el user ya que ahora es UsuarioEdit
  useEffect(() => {
    if (user) {
      // Solo resetear estado de contraseña si es un usuario diferente
      const isNewUser = currentUserRef.current !== user.usuario_acceso;
      
      setEditData({ ...user });
      
      if (isNewUser) {
        setEditPassword(false);
        setShowPassword(false);
        currentUserRef.current = user.usuario_acceso;
      }
    } else {
      setEditData(null);
      currentUserRef.current = null;
    }
  }, [user]);

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleFieldChange = (field: keyof UsuarioEdit, value: string | number | null) => {
    if (editData) {
      const updatedData = { ...editData, [field]: value };
      setEditData(updatedData);
      onChange(updatedData);
    }
  };

  const handleSave = () => {
    if (editData) {
      onChange(editData);
    }
    onSave();
  };

  if (!editData) return null;

  return (
    <Dialog 
      open={!!user} 
      onClose={() => (saving ? null : onClose())} 
      maxWidth="sm" 
      fullWidth
      disableRestoreFocus
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="edit-dialog-title"
    >
      <DialogTitle id="edit-dialog-title">Modificar usuario</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Fila 1: Nombre y Apellido */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nombre"
              value={editData.nombre_usuario}
              onChange={(e) => handleFieldChange('nombre_usuario', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Apellido"
              value={editData.apellido_usuario}
              onChange={(e) => handleFieldChange('apellido_usuario', e.target.value)}
              fullWidth
              required
            />
          </Stack>

          {/* Fila 2: Email y Teléfono */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Correo Electrónico"
              type="email"
              value={editData.correo_electronico}
              onChange={(e) => handleFieldChange('correo_electronico', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Teléfono"
              value={editData.telefono || ''}
              onChange={(e) => handleFieldChange('telefono', e.target.value || null)}
              fullWidth
              placeholder="ej: +1234567890"
            />
          </Stack>

          {/* Fila 3: Contraseña */}
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={editPassword}
                  onChange={(e) => setEditPassword(e.target.checked)}
                />
              }
              label="Cambiar contraseña"
            />
            {editPassword && (
              <TextField
                label="Nueva Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={editData.contrasena || ''}
                onChange={(e) => handleFieldChange('contrasena', e.target.value)}
                fullWidth
                placeholder="Ingrese nueva contraseña"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handlePasswordToggle}
                          edge="end"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Stack>

          {/* Fila 4: Rol y Establecimiento */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Rol */}
            <FormControl fullWidth required error={!!errorRoles}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={editData.id_rol || ''}
                onChange={(e) => handleFieldChange('id_rol', Number(e.target.value))}
                label="Rol"
                disabled={loadingRoles}
              >
                <MenuItem value="" disabled>
                  <em>
                    {loadingRoles 
                      ? 'Cargando roles...' 
                      : roles.length === 0 
                        ? 'No hay roles disponibles'
                        : 'Seleccione un rol'
                    }
                  </em>
                </MenuItem>
                {!loadingRoles && roles.map((rol) => (
                  <MenuItem key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errorRoles && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Error al cargar roles: {errorRoles}
                </Typography>
              )}
            </FormControl>

            {/* Establecimiento */}
            <FormControl fullWidth required error={!!errorEst}>
              <InputLabel>Establecimiento</InputLabel>
              <Select
                value={editData.id_establecimiento || ''}
                onChange={(e) => handleFieldChange('id_establecimiento', String(e.target.value))}
                label="Establecimiento"
                disabled={loadingEst}
              >
                <MenuItem value="" disabled>
                  <em>
                    {loadingEst 
                      ? 'Cargando establecimientos...' 
                      : establecimientos.length === 0 
                        ? 'No hay establecimientos disponibles'
                        : 'Seleccione un establecimiento'
                    }
                  </em>
                </MenuItem>
                {!loadingEst && editData.id_establecimiento && 
                 !establecimientos.find(e => e.id_establecimiento === editData.id_establecimiento) && (
                  <MenuItem value={editData.id_establecimiento} disabled>
                    {editData.id_establecimiento} (No disponible)
                  </MenuItem>
                )}
                {!loadingEst && establecimientos.map((est) => (
                  <MenuItem key={est.id_establecimiento} value={est.id_establecimiento}>
                    {est.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errorEst && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Error al cargar establecimientos: {errorEst}
                </Typography>
              )}
            </FormControl>
          </Stack>

          {/* Fila 5: Estado */}
          <FormControlLabel
            control={
              <Switch
                checked={editData.estado === 1}
                onChange={(e) => handleFieldChange('estado', e.target.checked ? 1 : 0)}
              />
            }
            label={editData.estado === 1 ? 'Usuario Activo' : 'Usuario Inactivo'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
