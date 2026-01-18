import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Alert severity="error">No tienes permisos para acceder a esta página.</Alert>
      <Button variant="contained" onClick={() => navigate('/dashboard/default', { replace: true })}>
        Ir al dashboard
      </Button>
    </Stack>
  );
}
