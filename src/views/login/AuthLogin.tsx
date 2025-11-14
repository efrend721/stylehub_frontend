import React from 'react';
import { useAuthLogin } from './';
import { Link } from 'react-router-dom';

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
import FormHelperText from '@mui/material/FormHelperText';

// project imports
import AnimateButton from '#/ui-component/extended/AnimateButton';
import CustomFormControl from '#/ui-component/extended/Form/CustomFormControl';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const {
    isLoading,
    checked,
    setChecked,
    showPassword,
    handleClickShowPassword,
    handleMouseDownPassword,
    fieldErrors,
    formData,
    handleInputChange,
    handleSubmit,
    alertHostRef
  } = useAuthLogin();

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }}>
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
          autoComplete="username"
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
          autoComplete="current-password"
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
