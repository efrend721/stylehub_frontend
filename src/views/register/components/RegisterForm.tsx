import { useRegisterForm } from '../hooks/useRegisterForm.ts';
import { Link } from 'react-router-dom';

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

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import AnimateButton from '#/ui-component/extended/AnimateButton';
import CustomFormControl from '#/ui-component/extended/Form/CustomFormControl';

export function RegisterForm() {
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
    alertHostRef,
    strength,
    level
  } = useRegisterForm();

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }}>
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
        control={
          <Checkbox
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            name="checked"
            color="primary"
            disabled={isLoading}
          />
        }
        label={
          <Typography variant="subtitle1">
            Acepto los &nbsp;
            <Typography variant="subtitle1" component={Link} to="#">
              Términos y Condiciones
            </Typography>
          </Typography>
        }
      />

      <div ref={alertHostRef} />

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            color="secondary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
