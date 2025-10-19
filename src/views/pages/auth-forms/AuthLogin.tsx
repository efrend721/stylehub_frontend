import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { trim } from 'utils/validators';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormHelperText from '@mui/material/FormHelperText';
import notify from 'utils/notify';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { useAuth } from 'contexts/AuthContext';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ usuario_acceso?: string; contrasena?: string }>({});
  // Contenedor imperativo para mostrar alertas sin re-render del componente
  const alertHostRef = useRef<HTMLDivElement | null>(null);
  const alertRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  // Formulario de datos
  const [formData, setFormData] = useState({
    usuario_acceso: '',
    contrasena: ''
  });

  const showAlert = (severity: 'error' | 'success', message: string) => {
    if (!alertHostRef.current) return;
    if (!alertRootRef.current) {
      alertRootRef.current = createRoot(alertHostRef.current);
    }
    alertRootRef.current.render(
      <Box sx={{ mt: 2 }}>
        <Alert severity={severity}>{message}</Alert>
      </Box>
    );
  };

  const clearAlert = () => {
    if (alertRootRef.current) {
      alertRootRef.current.unmount();
      alertRootRef.current = null;
    }
    if (alertHostRef.current) {
      alertHostRef.current.innerHTML = '';
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Limpiar alertas al escribir sin re-render
    clearAlert();
    // Limpiar error de campo al escribir
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAlert();
    // Validaciones en cliente antes de llamar al backend
    const usuario = trim(formData.usuario_acceso);
    const password = trim(formData.contrasena);

    const nextFieldErrors: { usuario_acceso?: string; contrasena?: string } = {};
    if (!usuario) nextFieldErrors.usuario_acceso = 'Campo obligatorio';
    else if (usuario.length < 3) nextFieldErrors.usuario_acceso = 'Mínimo 3 caracteres';
    if (!password) nextFieldErrors.contrasena = 'Campo obligatorio';
    else if (password.length < 6) nextFieldErrors.contrasena = 'Mínimo 6 caracteres';

    if (nextFieldErrors.usuario_acceso || nextFieldErrors.contrasena) {
      setFieldErrors(nextFieldErrors);
      showAlert('error', 'Por favor, corrige los campos marcados');
      return;
    }
    try {
      const res = await login({
        usuario_acceso: usuario,
        contrasena: password
      });
      // Mostrar mensaje de éxito desde el backend si existe; fallback a "Bienvenido, {nombre}!"
      const backendMsg = (res as any)?.message as string | undefined;
      const nombre = res?.data?.user?.nombre_usuario ?? 'Usuario';
      const successMsg = backendMsg || `¡Bienvenido, ${nombre}!`;
      showAlert('success', successMsg);
      // Mostrar el toast solo en Login y cerrarlo antes de navegar para que no se vea en el dashboard
      const toastId = notify.success(successMsg, { duration: 1000 });
      setTimeout(() => {
        // Cerrar el toast de forma explícita antes de cambiar de ruta
        notify.dismiss(toastId);
        navigate('/dashboard/default');
      }, 1000);
    } catch (_err) {
      // Los errores del backend se muestran como toast.error desde AuthContext.
      // No duplicamos alerta en pantalla para evitar ruido visual.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomFormControl fullWidth>
        <InputLabel htmlFor="outlined-adornment-usuario-login">Usuario de Acceso</InputLabel>
        <OutlinedInput
          id="outlined-adornment-usuario-login"
          type="text"
          value={formData.usuario_acceso}
          name="usuario_acceso"
          onChange={handleInputChange}
          label="Usuario de Acceso"
          error={Boolean(fieldErrors.usuario_acceso)}
          disabled={isLoading}
        />
        {fieldErrors.usuario_acceso && <FormHelperText error>{fieldErrors.usuario_acceso}</FormHelperText>}
      </CustomFormControl>

      <CustomFormControl fullWidth>
        <InputLabel htmlFor="outlined-adornment-password-login">Contraseña</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-login"
          type={showPassword ? 'text' : 'password'}
          value={formData.contrasena}
          name="contrasena"
          onChange={handleInputChange}
          error={Boolean(fieldErrors.contrasena)}
          disabled={isLoading}
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
          label="Contraseña"
        />
        {fieldErrors.contrasena && <FormHelperText error>{fieldErrors.contrasena}</FormHelperText>}
      </CustomFormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                name="checked"
                color="primary"
                disabled={isLoading}
              />
            }
            label="Mantenerme conectado"
          />
        </Grid>
        <Grid>
          <Typography variant="subtitle1" component={Link} to="#!" sx={{ textDecoration: 'none', color: 'secondary.main' }}>
            Forgot Password?
          </Typography>
        </Grid>
      </Grid>

      {/* Contenedor para alertas (renderizadas imperativamente) */}
      <div ref={alertHostRef} />

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button
            color="secondary"
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
