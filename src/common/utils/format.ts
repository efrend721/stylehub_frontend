export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES').format(date);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('es-ES').format(number);
};