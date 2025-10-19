import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import notify from 'utils/notify';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { useAuth } from 'contexts/AuthContext';
import { isEmail, trim, validatePassword, isValidPhone, sanitizeUsername, isValidUsername } from 'utils/validators';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===========================|| JWT - REGISTER ||=========================== //

export default function AuthRegister() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState<{ label: string; color: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    nombre_usuario?: string;
    apellido_usuario?: string;
    correo_electronico?: string;
    telefono?: string;
    contrasena?: string;
  }>({});

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    correo_electronico: '',
    usuario_acceso: '',
    contrasena: '',
    telefono: ''
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Función para generar usuario_acceso a partir del email
  const generateUsuarioAcceso = (email: string): string => {
    if (!email) return '';
    const emailParts = email.split('@');
    return emailParts[0] || '';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
    if (success) setSuccess(null);
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Si cambió el email, generar automáticamente el usuario_acceso
      if (name === 'correo_electronico') {
        newData.usuario_acceso = generateUsuarioAcceso(value);
      }
      return newData;
    });

    // Si cambió la contraseña, actualizar el indicador de fortaleza
    if (name === 'contrasena') {
      changePassword(value);
    }
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Limpiar mensajes previos
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    // Validaciones básicas
    const nombre = trim(formData.nombre_usuario);
    const apellido = trim(formData.apellido_usuario);
    const correo = trim(formData.correo_electronico);
    const telefono = trim(formData.telefono);
    const usuarioAcceso = trim(formData.usuario_acceso);
    const contrasena = trim(formData.contrasena);

    const nextFieldErrors: {
      nombre_usuario?: string;
      apellido_usuario?: string;
      correo_electronico?: string;
      telefono?: string;
      contrasena?: string;
    } = {};

    if (!nombre) nextFieldErrors.nombre_usuario = 'Campo obligatorio';
    if (!apellido) nextFieldErrors.apellido_usuario = 'Campo obligatorio';
    if (!correo) nextFieldErrors.correo_electronico = 'Campo obligatorio';
    else if (!isEmail(correo)) nextFieldErrors.correo_electronico = 'Correo inválido';

    if (!contrasena) nextFieldErrors.contrasena = 'Campo obligatorio';
    else {
      const pwdError = validatePassword(contrasena);
      if (pwdError) nextFieldErrors.contrasena = pwdError;
    }

    if (telefono && !isValidPhone(telefono)) {
      nextFieldErrors.telefono = 'Formato de teléfono inválido';
    }

    // Normaliza usuario_acceso y valida patrón
    const usuarioNormalizado = sanitizeUsername(usuarioAcceso);
    if (!usuarioNormalizado || !isValidUsername(usuarioNormalizado)) {
      // Aunque es de solo lectura, marca un error general
      setError('El usuario de acceso no se generó correctamente');
      setFieldErrors(nextFieldErrors);
      return;
    }

    if (!checked) {
      setError('Debes aceptar los términos y condiciones');
      setFieldErrors(nextFieldErrors);
      return;
    }

    if (
      nextFieldErrors.nombre_usuario ||
      nextFieldErrors.apellido_usuario ||
      nextFieldErrors.correo_electronico ||
      nextFieldErrors.telefono ||
      nextFieldErrors.contrasena
    ) {
      setFieldErrors(nextFieldErrors);
      setError('Por favor, corrige los campos marcados');
      return;
    }

    try {
      // Preparar datos según la estructura de la API

      const registerData = {
        usuario_acceso: usuarioNormalizado,
        contrasena,
        nombre_usuario: nombre,
        apellido_usuario: apellido,
        correo_electronico: correo,
        ...(telefono && { telefono })
      };

      const response = await register(registerData);
      if (response.success) {
        const successMsg = `¡Usuario registrado exitosamente! Usuario: ${response.data.usuario_acceso}`;
  setSuccess(successMsg);
  notify.success(successMsg);
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (_err) {
      // Los errores del backend se muestran como toast.error desde AuthContext.
      // Mantén solo las alertas locales para validaciones de cliente.
    }
  };

  useEffect(() => {
    if (formData.contrasena) {
      setStrength(strengthIndicator(formData.contrasena));
    }
  }, [formData.contrasena]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack sx={{ mb: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1">Registro de Usuario</Typography>
      </Stack>

      <Grid container spacing={{ xs: 0, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormControl fullWidth>
            <InputLabel>Nombre</InputLabel>
            <OutlinedInput
              type="text"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleInputChange}
              label="Nombre"
              disabled={isLoading}
              error={Boolean(fieldErrors.nombre_usuario)}
            />
            {fieldErrors.nombre_usuario && <FormHelperText error>{fieldErrors.nombre_usuario}</FormHelperText>}
          </CustomFormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormControl fullWidth>
            <InputLabel>Apellido</InputLabel>
            <OutlinedInput
              type="text"
              name="apellido_usuario"
              value={formData.apellido_usuario}
              onChange={handleInputChange}
              label="Apellido"
              disabled={isLoading}
              error={Boolean(fieldErrors.apellido_usuario)}
            />
            {fieldErrors.apellido_usuario && <FormHelperText error>{fieldErrors.apellido_usuario}</FormHelperText>}
          </CustomFormControl>
        </Grid>
      </Grid>

      <CustomFormControl fullWidth>
        <InputLabel>Correo Electrónico</InputLabel>
        <OutlinedInput
          type="email"
          name="correo_electronico"
          value={formData.correo_electronico}
          onChange={handleInputChange}
          label="Correo Electrónico"
          disabled={isLoading}
          error={Boolean(fieldErrors.correo_electronico)}
        />
        {fieldErrors.correo_electronico && <FormHelperText error>{fieldErrors.correo_electronico}</FormHelperText>}
      </CustomFormControl>

      <CustomFormControl fullWidth>
        <InputLabel>Teléfono (Opcional)</InputLabel>
        <OutlinedInput
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleInputChange}
          label="Teléfono (Opcional)"
          disabled={isLoading}
          error={Boolean(fieldErrors.telefono)}
        />
        {fieldErrors.telefono && <FormHelperText error>{fieldErrors.telefono}</FormHelperText>}
      </CustomFormControl>

      <CustomFormControl fullWidth>
        <InputLabel>Usuario de Acceso (Generado automáticamente)</InputLabel>
        <OutlinedInput type="text" name="usuario_acceso" value={formData.usuario_acceso} disabled label="Usuario de Acceso" />
      </CustomFormControl>

      <CustomFormControl fullWidth>
        <InputLabel>Contraseña</InputLabel>
        <OutlinedInput
          type={showPassword ? 'text' : 'password'}
          value={formData.contrasena}
          name="contrasena"
          onChange={handleInputChange}
          label="Contraseña"
          disabled={isLoading}
          error={Boolean(fieldErrors.contrasena)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
                disabled={isLoading}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        {fieldErrors.contrasena && <FormHelperText error>{fieldErrors.contrasena}</FormHelperText>}
      </CustomFormControl>

      {strength !== 0 && level && (
        <FormControl fullWidth>
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 85, height: 8, borderRadius: '7px', bgcolor: level.color }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>
                {level.label}
              </Typography>
            </Stack>
          </Box>
        </FormControl>
      )}

      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" disabled={isLoading} />}
        label={
          <Typography variant="subtitle1">
            Acepto los &nbsp;
            <Typography variant="subtitle1" component={Link} to="#">
              Términos y Condiciones
            </Typography>
          </Typography>
        }
      />

      {/* Mensajes de error y éxito */}
      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {success && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success">{success}</Alert>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
