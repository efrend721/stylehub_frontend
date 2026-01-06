import { useState, useEffect, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

import { NuevoUsuario } from './types';
// Establecimiento se asigna automáticamente según el perfil del administrador
import { useRoles } from './useRoles';
import { useFocusManagement, useInertBackground } from '../../../hooks/useFocusManagement';

type Props = {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (usuario: NuevoUsuario) => void;
  fieldErrors?: Record<string, string>;
};

export function UsuariosCreateDialog({ open, saving, onClose, onSave, fieldErrors = {} }: Props) {
  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  
  // Aplicar atributo inert al fondo cuando el modal está abierto
  useInertBackground(open);
  
  const [showPassword, setShowPassword] = useState(false);
  const [usernameEdited, setUsernameEdited] = useState(false);
  
  const initialUsuario: NuevoUsuario = useMemo(() => ({
    usuario_acceso: '',
    contrasena: '',
    nombre_usuario: '',
    apellido_usuario: '',
    correo_electronico: '',
    telefono: '',
    id_rol: 0,
    id_establecimiento: '',
    estado: 1
  }), []);
  
  const [usuario, setUsuario] = useState<NuevoUsuario>(initialUsuario);
  
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setUsuario(initialUsuario);
      setShowPassword(false);
      setUsernameEdited(false);
    }
  }, [open, initialUsuario]);

  const handleClose = () => {
    if (saving) return;
    setUsuario(initialUsuario);
    onClose();
  };

  const handleSave = () => {
    onSave(usuario);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !saving) {
      handleSave();
    }
  };

  // Helper to generate username from nombre + apellido in lowercase, accents removed, spaces stripped
  const generateUsername = (nombre: string, apellido: string): string => {
    const normalize = (s: string) => s
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    return normalize(nombre) + normalize(apellido);
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    const next = { ...usuario, nombre_usuario: nombre };
    // Auto-generate username live unless user edited manually
    if (!usernameEdited) {
      next.usuario_acceso = generateUsername(nombre, next.apellido_usuario);
    }
    setUsuario(next);
  };

  const handleApellidoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apellido = e.target.value;
    const next = { ...usuario, apellido_usuario: apellido };
    if (!usernameEdited) {
      next.usuario_acceso = generateUsername(next.nombre_usuario, apellido);
    }
    setUsuario(next);
  };

  const handleUsuarioAccesoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuario({ ...usuario, usuario_acceso: e.target.value });
    setUsernameEdited(true);
  };
  const validateEmail = (value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Correo electrónico inválido';
    return '';
  };

  const validatePhone = (value: string): string => {
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(value.trim())) return 'El teléfono solo debe contener números';
    return '';
  };

  const validatePassword = (value: string): string => {
    if (value.trim().length <= 7) return 'La contraseña debe tener al menos 8 caracteres';
    return '';
  };

  // Auto-generate username whenever Nombre/Apellido change, unless user edited manually
  useEffect(() => {
    if (!usernameEdited) {
      const gen = generateUsername(usuario.nombre_usuario, usuario.apellido_usuario);
      if (usuario.usuario_acceso !== gen) {
        setUsuario((prev) => ({ ...prev, usuario_acceso: gen }));
      }
    }
  }, [usuario.nombre_usuario, usuario.apellido_usuario, usuario.usuario_acceso, usernameEdited]);

  const isFormValid = 
    usuario.usuario_acceso.trim() &&
    usuario.contrasena.trim() &&
    usuario.nombre_usuario.trim() &&
    usuario.apellido_usuario.trim() &&
    usuario.correo_electronico.trim() &&
    usuario.telefono.trim() &&
    usuario.id_rol > 0 &&
    !validateEmail(usuario.correo_electronico) &&
    !validatePhone(usuario.telefono) &&
    !validatePassword(usuario.contrasena);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableRestoreFocus
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">Crear Nuevo Usuario</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Orden fijo: Nombre, Apellido, Correo, Teléfono, Usuario Acceso, Contraseña, Rol */}
            {/* Nombre y Apellido */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="nombre_usuario"
                name="nombre_usuario"
                inputRef={firstFieldRef}
                label="Nombre"
                value={usuario.nombre_usuario}
                onChange={handleNombreChange}
                fullWidth
                required
                autoComplete="given-name"
              />
              <TextField
                id="apellido_usuario"
                name="apellido_usuario"
                label="Apellido"
                value={usuario.apellido_usuario}
                onChange={handleApellidoChange}
                fullWidth
                required
                autoComplete="family-name"
              />
            </Stack>

            {/* Correo y Teléfono */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="correo_electronico"
                name="correo_electronico"
                label="Correo Electrónico"
                type="email"
                value={usuario.correo_electronico}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsuario({ ...usuario, correo_electronico: v });
                  const msg = v ? validateEmail(v) : '';
                  setLocalErrors((prev) => ({ ...prev, correo_electronico: msg }));
                }}
                fullWidth
                required
                placeholder="ej: mario.lopez@stylehub.com"
                autoComplete="email"
                error={Boolean(fieldErrors.correo_electronico || localErrors.correo_electronico)}
                helperText={fieldErrors.correo_electronico || localErrors.correo_electronico || undefined}
              />
              <TextField
                id="telefono"
                name="telefono"
                label="Teléfono"
                value={usuario.telefono}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsuario({ ...usuario, telefono: v });
                  const msg = v ? validatePhone(v) : '';
                  setLocalErrors((prev) => ({ ...prev, telefono: msg }));
                }}
                fullWidth
                required
                placeholder="ej: 1234567890"
                autoComplete="tel"
                slotProps={{
                  htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' }
                }}
                error={Boolean(fieldErrors.telefono || localErrors.telefono)}
                helperText={fieldErrors.telefono || localErrors.telefono || undefined}
              />
            </Stack>

            {/* Usuario y Contraseña */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="usuario_acceso"
                name="usuario_acceso"
                label="Usuario de Acceso"
                value={usuario.usuario_acceso}
                onChange={handleUsuarioAccesoChange}
                fullWidth
                required
                placeholder="ej: mario.lopez"
                autoComplete="username"
                error={Boolean(fieldErrors.usuario_acceso)}
                helperText={fieldErrors.usuario_acceso || undefined}
              />
              <TextField
                id="contrasena"
                name="contrasena"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={usuario.contrasena}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsuario({ ...usuario, contrasena: v });
                  const msg = v ? validatePassword(v) : '';
                  setLocalErrors((prev) => ({ ...prev, contrasena: msg }));
                }}
                fullWidth
                required
                autoComplete="new-password"
                error={Boolean(fieldErrors.contrasena || localErrors.contrasena)}
                helperText={fieldErrors.contrasena || localErrors.contrasena || undefined}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <IconEyeOff size="20" /> : <IconEye size="20" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
            {/* Fila 4: Rol */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* Rol */}
              <FormControl fullWidth required error={!!errorRoles || Boolean(fieldErrors.id_rol)}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={usuario.id_rol === 0 ? '' : usuario.id_rol}
                  onChange={(e) => {
                    const newValue = Number(e.target.value) || 0;
                    setUsuario({ ...usuario, id_rol: newValue });
                  }}
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
                {loadingRoles && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Skeleton variant="rectangular" width={100} height={20} />
                    <Skeleton variant="rectangular" width={140} height={20} />
                  </Stack>
                )}
                {errorRoles && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errorRoles}
                  </Typography>
                )}
                {fieldErrors.id_rol && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {fieldErrors.id_rol}
                  </Typography>
                )}
              </FormControl>

              
            </Stack>

            {/* Estado */}
            <FormControlLabel
              control={
                <Switch
                  id="estado"
                  name="estado"
                  checked={usuario.estado === 1}
                  onChange={(e) => setUsuario({ ...usuario, estado: e.target.checked ? 1 : 0 })}
                  slotProps={{
                    input: {
                      'aria-describedby': 'estado-description'
                    }
                  }}
                />
              }
              label={
                <span id="estado-description">
                  {usuario.estado === 1 ? 'Usuario Activo' : 'Usuario Inactivo'}
                </span>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            disabled={saving || !isFormValid}
          >
            {saving ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}