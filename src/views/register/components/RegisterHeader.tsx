import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function RegisterHeader(props: { downMD: boolean }) {
  const { downMD } = props;
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main', mb: 0 }}>
        Registro
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '16px', textAlign: { xs: 'center', md: 'inherit' } }}>
        Ingresa tus datos para continuar
      </Typography>
    </Stack>
  );
}
