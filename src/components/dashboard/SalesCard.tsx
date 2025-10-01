import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
//import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import type { CardData } from '../../types/dashboard';

interface SalesCardProps {
  data: CardData;
}

export const SalesCard: React.FC<SalesCardProps> = ({ data }) => {
  // Determinar el color y icono basado en el trimestre
  const getCardTheme = (title: string) => {
    if (title.includes('Q1')) return {
      color: '#2563eb',
      backgroundColor: '#eff6ff',
      icon: <AssessmentIcon />,
    };
    if (title.includes('Q2')) return {
      color: '#059669',
      backgroundColor: '#ecfdf5',
      icon: <TrendingUpIcon />,
    };
    if (title.includes('Q3')) return {
      color: '#d97706',
      backgroundColor: '#fffbeb',
      icon: <PeopleIcon />,
    };
    return {
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      icon: <AttachMoneyIcon />,
    };
  };

  const theme = getCardTheme(data.title);

  return (
    <Card
      sx={{
        width: 450,
        minHeight: 380,
        backgroundColor: 'background.paper',
        position: "relative",
      }}
    >
      {/* Barra superior de color */}
      <Box
        sx={{
          height: "4px",
          backgroundColor: theme.color,
          width: "100%",
        }}
      />
      
      <CardContent sx={{ p: 3 }}>
        {/* Header con título e ícono */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: "text.primary",
              fontSize: "1.1rem",
            }}
          >
            {data.title}
          </Typography>
          <Box 
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: theme.backgroundColor,
              color: theme.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme.icon}
          </Box>
        </Box>

        {/* Items de información */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                Valor actual
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                {data.value}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                Período
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                {data.subtitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                Cambio vs anterior
              </Typography>
              <Chip 
                label={data.change}
                size="small"
                sx={{
                  backgroundColor: data.positive ? "success.light" : "error.light",
                  color: data.positive ? "success.contrastText" : "error.contrastText",
                  fontWeight: 600,
                  fontSize: "0.75rem"
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Total */}
        <Box
          sx={{
            backgroundColor: theme.backgroundColor,
            borderRadius: "12px",
            p: 3,
            textAlign: "center",
            border: `2px solid ${theme.color}`,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary",
              fontWeight: 500,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.75rem"
            }}
          >
            Total Neto
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              color: theme.color,
              fontWeight: 700,
              fontSize: "2rem"
            }}
          >
            {data.value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};