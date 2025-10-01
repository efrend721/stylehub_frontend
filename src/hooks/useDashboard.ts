import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { setCards, updateCard, setPeriod, setLoading, setError } from '../redux/states/dashboard';
import type { CardData } from '../types/dashboard';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((state) => state.dashboard);

  const updateCards = useCallback((cards: CardData[]) => {
    dispatch(setLoading(true));
    // Simulate API call
    setTimeout(() => {
      dispatch(setCards(cards));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  const modifyCard = useCallback((index: number, card: CardData) => {
    dispatch(updateCard({ index, card }));
  }, [dispatch]);

  const changePeriod = useCallback((period: 'quarterly' | 'monthly' | 'yearly') => {
    dispatch(setLoading(true));
    dispatch(setPeriod(period));
    
    // Simulate fetching new data for the period
    setTimeout(() => {
      // Here you would typically fetch new data based on the period
      dispatch(setLoading(false));
    }, 800);
  }, [dispatch]);

  const refreshDashboard = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock refreshed data
      const refreshedCards: CardData[] = [
        {
          title: 'Ventas Q1',
          value: '$26,300',
          change: '+15%',
          positive: true,
          subtitle: 'Enero - Marzo (Actualizado)',
        },
        {
          title: 'Ventas Q2',
          value: '$34,100',
          change: '+22%',
          positive: true,
          subtitle: 'Abril - Junio (Actualizado)',
        },
        {
          title: 'Ventas Q3',
          value: '$30,500',
          change: '-2%',
          positive: false,
          subtitle: 'Julio - Septiembre (Actualizado)',
        },
        {
          title: 'Ventas Q4',
          value: '$43,200',
          change: '+28%',
          positive: true,
          subtitle: 'Octubre - Diciembre (Actualizado)',
        },
      ];
      
      dispatch(setCards(refreshedCards));
    } catch {
      dispatch(setError('Error al actualizar el dashboard'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    ...dashboardState,
    updateCards,
    modifyCard,
    changePeriod,
    refreshDashboard,
  };
};