import React from 'react';
import { Box } from '@mui/material';
import { SalesCard } from './SalesCard';
import type { CardData } from '../../types/dashboard';

const cardsData: CardData[] = [
  {
    title: "Ventas Q1 2025",
    productos: "1,250 unidades",
    clientes: "87 clientes",
    ingresos: "$125,000",
    margen: "35%",
    total: "$81,250",
  },
  {
    title: "Ventas Q2 2025",
    productos: "1,580 unidades",
    clientes: "124 clientes",
    ingresos: "$158,000",
    margen: "42%",
    total: "$110,360",
  },
  {
    title: "Ventas Q3 2025",
    productos: "1,250 unidades",
    clientes: "87 clientes",
    ingresos: "$125,000",
    margen: "35%",
    total: "$81,250",
  },
  {
    title: "Ventas Q4 2025",
    productos: "1,250 unidades",
    clientes: "87 clientes",
    ingresos: "$125,000",
    margen: "35%",
    total: "$81,250",
  },
];

export const DashboardContent: React.FC = () => {
//function DashboardContent() {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        justifyContent: "center",
        p: 4,
      }}
    >
      {cardsData.map((card, index) => (
        <SalesCard key={index} data={card} />
      ))}
    </Box>
  );
};
//export default DashboardContent;