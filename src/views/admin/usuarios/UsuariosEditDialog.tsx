import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
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
// Establecimiento se asigna automáticamente según el perfil del administrador
import { useRoles } from './useRoles';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '#/contexts/AuthContext';

type Props = {
  user: UsuarioEdit | null;
  saving: boolean;
  onClose: () => void;
  onChange: (user: UsuarioEdit) => void;
  onSave: () => void;
  fieldErrors?: Record<string, string>;
};

export function UsuariosEditDialog({ user, saving, onClose, onChange, onSave, fieldErrors = {} }: Props) {
  const { user: authUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [editData, setEditData] = useState<UsuarioEdit | null>(null);
  const currentUserRef = useRef<string | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

  function normalizeForCompare(u: UsuarioEdit, passwordForCompare: string) {
    const telefono = (u.telefono ?? '').trim();
    const idEst = (u.id_establecimiento ?? '').trim();
    return {
      nombre_usuario: (u.nombre_usuario ?? '').trim(),
      apellido_usuario: (u.apellido_usuario ?? '').trim(),
      correo_electronico: (u.correo_electronico ?? '').trim(),
      telefono: telefono === '' ? null : telefono,
      id_rol: Number(u.id_rol),
      id_establecimiento: idEst,
      estado: Number(u.estado),
      contrasena: passwordForCompare
    };
  }

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
        setLocalErrors({});
        initialSnapshotRef.current = JSON.stringify(normalizeForCompare(user, ''));
      }
    } else {
      setEditData(null);
      currentUserRef.current = null;
      setLocalErrors({});
      initialSnapshotRef.current = null;
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
      if (typeof value === 'string') {
        if (field === 'correo_electronico') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const msg = value ? (emailRegex.test(value.trim()) ? '' : 'Correo electrónico inválido') : '';
          setLocalErrors((prev) => ({ ...prev, correo_electronico: msg }));
        }
        if (field === 'telefono') {
          const phoneRegex = /^\d+$/;
          const msg = value ? (phoneRegex.test(value.trim()) ? '' : 'El teléfono solo debe contener números') : '';
          setLocalErrors((prev) => ({ ...prev, telefono: msg }));
        }
        if (field === 'contrasena') {
          const msg = value ? (value.trim().length > 7 ? '' : 'La contraseña debe tener al menos 8 caracteres') : '';
          setLocalErrors((prev) => ({ ...prev, contrasena: msg }));
        }
      }
    }
  };

  const handleEditPasswordChange = (enabled: boolean) => {
    setEditPassword(enabled);
    if (!enabled && editData) {
      const updatedData = { ...editData, contrasena: null };
      setEditData(updatedData);
      onChange(updatedData);
      setLocalErrors((prev) => ({ ...prev, contrasena: '' }));
    }
  };

  const handleSave = () => {
    if (editData) {
      onChange(editData);
    }
    onSave();
  };

  if (!editData) return null;

  const isRole2EditingSelf = authUser?.id_rol === 2 && authUser?.usuario_acceso === editData.usuario_acceso;

  const passwordForCompare = editPassword ? (editData.contrasena ?? '').trim() : '';
  const isDirty =
    initialSnapshotRef.current !== null &&
    JSON.stringify(normalizeForCompare(editData, passwordForCompare)) !== initialSnapshotRef.current;

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
              error={Boolean(fieldErrors.nombre_usuario)}
              helperText={fieldErrors.nombre_usuario || undefined}
            />
            <TextField
              label="Apellido"
              value={editData.apellido_usuario}
              onChange={(e) => handleFieldChange('apellido_usuario', e.target.value)}
              fullWidth
              required
              error={Boolean(fieldErrors.apellido_usuario)}
              helperText={fieldErrors.apellido_usuario || undefined}
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
              error={Boolean(fieldErrors.correo_electronico || localErrors.correo_electronico)}
              helperText={fieldErrors.correo_electronico || localErrors.correo_electronico || undefined}
            />
            <TextField
              label="Teléfono"
              value={editData.telefono || ''}
              onChange={(e) => handleFieldChange('telefono', e.target.value || null)}
              fullWidth
              placeholder="ej: 1234567890"
              slotProps={{
                htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' }
              }}
              error={Boolean(fieldErrors.telefono || localErrors.telefono)}
              helperText={fieldErrors.telefono || localErrors.telefono || undefined}
            />
          </Stack>

          {/* Fila 3: Contraseña */}
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={editPassword}
                  onChange={(e) => handleEditPasswordChange(e.target.checked)}
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
                error={Boolean(fieldErrors.contrasena || localErrors.contrasena)}
                helperText={fieldErrors.contrasena || localErrors.contrasena || undefined}
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

          {/* Fila 4: Rol */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Rol */}
            <FormControl fullWidth required error={!!errorRoles}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={editData.id_rol || ''}
                onChange={(e) => handleFieldChange('id_rol', Number(e.target.value))}
                label="Rol"
                disabled={loadingRoles || isRole2EditingSelf}
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
              {loadingRoles && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                  <Skeleton variant="rectangular" width={140} height={20} />
                </Stack>
              )}
              {errorRoles && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  Error al cargar roles: {errorRoles}
                </Typography>
              )}
              {fieldErrors.id_rol && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {fieldErrors.id_rol}
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
        <Button onClick={handleSave} variant="contained" disabled={saving || !isDirty}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
