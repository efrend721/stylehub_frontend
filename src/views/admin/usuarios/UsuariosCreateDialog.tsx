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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

import { NuevoUsuario } from './types';
import { useEstablecimientos } from './useEstablecimientos';
import { useRoles } from './useRoles';
import { useFocusManagement, useInertBackground } from '../../../hooks/useFocusManagement';

type Props = {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (usuario: NuevoUsuario) => void;
};

export function UsuariosCreateDialog({ open, saving, onClose, onSave }: Props) {
  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  
  // Aplicar atributo inert al fondo cuando el modal está abierto
  useInertBackground(open);
  
  const [showPassword, setShowPassword] = useState(false);
  
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
  
  const { establecimientos, loading: loadingEst, error: errorEst } = useEstablecimientos();
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setUsuario(initialUsuario);
      setShowPassword(false);
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

  const isFormValid = 
    usuario.usuario_acceso.trim() &&
    usuario.contrasena.trim() &&
    usuario.nombre_usuario.trim() &&
    usuario.apellido_usuario.trim() &&
    usuario.correo_electronico.trim() &&
    usuario.telefono.trim() &&
    usuario.id_rol > 0 &&
    usuario.id_establecimiento.trim();

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
            {/* Fila 1: Usuario y Contraseña */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="usuario_acceso"
                name="usuario_acceso"
                inputRef={firstFieldRef}
                label="Usuario de Acceso"
                value={usuario.usuario_acceso}
                onChange={(e) => setUsuario({ ...usuario, usuario_acceso: e.target.value })}
                fullWidth
                required
                placeholder="ej: mario.lopez"
                autoComplete="username"
              />
              <TextField
                id="contrasena"
                name="contrasena"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={usuario.contrasena}
                onChange={(e) => setUsuario({ ...usuario, contrasena: e.target.value })}
                fullWidth
                required
                autoComplete="new-password"
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

            {/* Fila 2: Nombre y Apellido */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="nombre_usuario"
                name="nombre_usuario"
                label="Nombre"
                value={usuario.nombre_usuario}
                onChange={(e) => setUsuario({ ...usuario, nombre_usuario: e.target.value })}
                fullWidth
                required
                autoComplete="given-name"
              />
              <TextField
                id="apellido_usuario"
                name="apellido_usuario"
                label="Apellido"
                value={usuario.apellido_usuario}
                onChange={(e) => setUsuario({ ...usuario, apellido_usuario: e.target.value })}
                fullWidth
                required
                autoComplete="family-name"
              />
            </Stack>

            {/* Fila 3: Correo y Teléfono */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                id="correo_electronico"
                name="correo_electronico"
                label="Correo Electrónico"
                type="email"
                value={usuario.correo_electronico}
                onChange={(e) => setUsuario({ ...usuario, correo_electronico: e.target.value })}
                fullWidth
                required
                placeholder="ej: mario.lopez@stylehub.com"
                autoComplete="email"
              />
              <TextField
                id="telefono"
                name="telefono"
                label="Teléfono"
                value={usuario.telefono}
                onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
                fullWidth
                required
                placeholder="ej: +1234567890"
                autoComplete="tel"
              />
            </Stack>

            {/* Fila 4: Rol y Establecimiento */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* Rol */}
              <FormControl fullWidth required error={!!errorRoles}>
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
                {errorRoles && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errorRoles}
                  </Typography>
                )}
              </FormControl>

              {/* Establecimiento */}
              <FormControl fullWidth required error={!!errorEst}>
                <InputLabel>Establecimiento</InputLabel>
                <Select
                  value={usuario.id_establecimiento || ''}
                  onChange={(e) => {
                    const newValue = String(e.target.value);
                    setUsuario({ ...usuario, id_establecimiento: newValue });
                  }}
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
                  {!loadingEst && establecimientos.map((est) => (
                    <MenuItem key={est.id_establecimiento} value={est.id_establecimiento}>
                      {est.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errorEst && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errorEst}
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