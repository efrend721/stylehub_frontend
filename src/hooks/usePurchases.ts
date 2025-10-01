import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  setPurchases, 
  addPurchase, 
  updatePurchase, 
  deletePurchase, 
  setMonthlySummary,
  setLoading,
  setError 
} from '../redux/states/purchases';

interface Purchase {
  id: string;
  productName: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  category: string;
}

export const usePurchases = () => {
  const dispatch = useAppDispatch();
  const purchasesState = useAppSelector((state) => state.purchases);

  const loadPurchases = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockPurchases: Purchase[] = [
        {
          id: '1',
          productName: 'Camisa Empresarial',
          amount: 45.99,
          date: '2024-01-15',
          status: 'completed',
          category: 'Ropa',
        },
        {
          id: '2',
          productName: 'Zapatos de Vestir',
          amount: 129.50,
          date: '2024-01-20',
          status: 'completed',
          category: 'Calzado',
        },
        {
          id: '3',
          productName: 'Traje Completo',
          amount: 299.99,
          date: '2024-02-01',
          status: 'pending',
          category: 'Ropa',
        },
      ];
      
      dispatch(setPurchases(mockPurchases));
    } catch {
      dispatch(setError('Error al cargar las compras'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createPurchase = useCallback((purchase: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString(),
    };
    dispatch(addPurchase(newPurchase));
  }, [dispatch]);

  const modifyPurchase = useCallback((id: string, updates: Partial<Purchase>) => {
    dispatch(updatePurchase({ id, updates }));
  }, [dispatch]);

  const removePurchase = useCallback((id: string) => {
    dispatch(deletePurchase(id));
  }, [dispatch]);

  const calculateMonthlySummary = useCallback(() => {
    const summary = purchasesState.purchases.reduce((acc, purchase) => {
      const month = new Date(purchase.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      
      if (existing) {
        existing.total += purchase.amount;
        existing.count += 1;
      } else {
        acc.push({
          month,
          total: purchase.amount,
          count: 1,
        });
      }
      
      return acc;
    }, [] as { month: string; total: number; count: number }[]);
    
    dispatch(setMonthlySummary(summary));
  }, [dispatch, purchasesState.purchases]);

  return {
    ...purchasesState,
    loadPurchases,
    createPurchase,
    modifyPurchase,
    removePurchase,
    calculateMonthlySummary,
  };
};