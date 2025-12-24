import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function LoginHeader(props: { downMD: boolean }) {
  const { downMD } = props;
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Typography variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
        Hola, Bienvenido de Vuelta
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '16px', textAlign: { xs: 'center', md: 'inherit' } }}>
        Ingresa tus credenciales para continuar
      </Typography>
    </Stack>
  );
}
