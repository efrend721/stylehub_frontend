import { useState, useEffect } from 'react';

interface DashboardData {
  users: number;
  products: number;
  sales: number;
  orders: number;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    users: 0,
    products: 0,
    sales: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      setLoading(true);
      
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData({
        users: 1234,
        products: 567,
        sales: 12345,
        orders: 89,
      });
      
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    data,
    loading,
  };
};