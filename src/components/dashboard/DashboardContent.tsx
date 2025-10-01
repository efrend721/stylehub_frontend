import React, { useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, type SelectChangeEvent } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { SalesCard } from './SalesCard';
import { useDashboard } from '../../hooks/useDashboard';
import { subjectManager } from '../../utils/SubjectManager';

export const DashboardContent: React.FC = () => {
  const { 
    cards, 
    selectedPeriod, 
    isLoading, 
    error, 
    changePeriod, 
    refreshDashboard 
  } = useDashboard();

  useEffect(() => {
    if (error) {
      subjectManager.showError('Error', error);
    }
  }, [error]);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    changePeriod(event.target.value as 'quarterly' | 'monthly' | 'yearly');
    subjectManager.showInfo('Período cambiado', `Datos actualizados para vista ${event.target.value}`);
  };

  const handleRefresh = () => {
    refreshDashboard();
    subjectManager.showInfo('Actualizando', 'Refrescando datos del dashboard...');
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 600,
          color: 'text.primary'
        }}>
          Dashboard de Ventas
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedPeriod}
              label="Período"
              onChange={handlePeriodChange}
              disabled={isLoading}
            >
              <MenuItem value="monthly">Mensual</MenuItem>
              <MenuItem value="quarterly">Trimestral</MenuItem>
              <MenuItem value="yearly">Anual</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleRefresh}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
          p: 2,
        }}
      >
        {cards.map((card, index) => (
          <SalesCard key={index} data={card} />
        ))}
      </Box>
    </>
  );
};