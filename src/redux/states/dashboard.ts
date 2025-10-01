import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CardData } from '../../types/dashboard';

export interface DashboardState {
  cards: CardData[];
  selectedPeriod: 'quarterly' | 'monthly' | 'yearly';
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  cards: [
    {
      title: 'Ventas Q1',
      value: '$24,500',
      change: '+12%',
      positive: true,
      subtitle: 'Enero - Marzo',
    },
    {
      title: 'Ventas Q2',
      value: '$32,800',
      change: '+18%',
      positive: true,
      subtitle: 'Abril - Junio',
    },
    {
      title: 'Ventas Q3',
      value: '$28,200',
      change: '-8%',
      positive: false,
      subtitle: 'Julio - Septiembre',
    },
    {
      title: 'Ventas Q4',
      value: '$41,600',
      change: '+25%',
      positive: true,
      subtitle: 'Octubre - Diciembre',
    },
  ],
  selectedPeriod: 'quarterly',
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCards: (state, action: PayloadAction<CardData[]>) => {
      state.cards = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateCard: (state, action: PayloadAction<{ index: number; card: CardData }>) => {
      const { index, card } = action.payload;
      if (index >= 0 && index < state.cards.length) {
        state.cards[index] = card;
        state.lastUpdated = new Date().toISOString();
      }
    },
    setPeriod: (state, action: PayloadAction<DashboardState['selectedPeriod']>) => {
      state.selectedPeriod = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCards, updateCard, setPeriod, setLoading, setError } = dashboardSlice.actions;
export default dashboardSlice.reducer;