import { Typography, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: 180,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: theme.transitions.create(['transform', 'box-shadow']),
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

const DashboardTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 300,
  color: theme.palette.text.primary,
}));

export const MainContent = () => {
  return (
    <>
      <DashboardTitle variant="h4" gutterBottom>
        Panel de Control - Salón de Belleza
      </DashboardTitle>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Clientes
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                1,234
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Servicios
              </Typography>
              <Typography variant="h3" color="secondary.main" fontWeight="bold">
                25
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Ingresos Hoy
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                €2,450
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Citas Hoy
              </Typography>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                18
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </>
  );
};