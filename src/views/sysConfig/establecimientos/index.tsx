import { Box, Button, CircularProgress, Grid, Stack } from '@mui/material';
import MainCard from '#/ui-component/cards/MainCard';
import { EstablishmentForm } from './components';
import { useEstablecimiento } from './hooks';
import { useNavigate } from 'react-router-dom';

export default function EstablishmentEditPage() {
  const { loading, saving, error, establecimiento, fieldErrors, tipos, handleChange, save } = useEstablecimiento();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!establecimiento || error) {
    return null;
  }

  return (
    <MainCard title="Editar Establecimiento">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 12 }}>
          <EstablishmentForm value={establecimiento} tipos={tipos} errors={fieldErrors} onChange={handleChange} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={() => { void navigate('/dashboard/default'); }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={() => { void save(); }} 
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
