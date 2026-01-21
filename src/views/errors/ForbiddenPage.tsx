import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useLocation, useNavigate } from 'react-router-dom';

type ForbiddenState = {
  message?: string;
  source?: string;
};

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? {}) as ForbiddenState;
  const message = typeof state.message === 'string' && state.message.trim() ? state.message.trim() : null;
  const isAppBlocked = state.source === 'routes';

  const defaultMessage = isAppBlocked
    ? 'No tienes permisos para acceder a esta aplicación.'
    : 'No tienes permisos para acceder a esta página.';

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Alert severity="error">{message ?? defaultMessage}</Alert>
      <Button variant="contained" onClick={() => navigate('/dashboard/default', { replace: true })}>
        Ir al dashboard
      </Button>
    </Stack>
  );
}
