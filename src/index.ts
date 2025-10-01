// Redux store and state
export { store } from './redux/store';
export type { RootState, AppDispatch } from './redux/store';

// Redux state slices
export { 
  navigationSlice, 
  setCurrentView, 
  setLoading as setNavigationLoading 
} from './redux/states/navigation';
export { 
  authSlice, 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser 
} from './redux/states/auth';
export { 
  purchasesSlice, 
  setPurchases, 
  addPurchase, 
  updatePurchase, 
  deletePurchase, 
  setMonthlySummary,
  setLoading as setPurchasesLoading,
  setError as setPurchasesError 
} from './redux/states/purchases';
export { 
  dashboardSlice, 
  setCards, 
  updateCard, 
  setPeriod, 
  setLoading as setDashboardLoading, 
  setError as setDashboardError 
} from './redux/states/dashboard';

// Custom hooks
export { useAppDispatch, useAppSelector } from './hooks/redux';
export { useNavigation } from './hooks/useNavigation';
export { useDashboard } from './hooks/useDashboard';
export { usePurchases } from './hooks/usePurchases';

// Utilities
export { subjectManager } from './utils/SubjectManager';
export type { ModalData, NotificationData } from './utils/SubjectManager';

// Theme
export { appTheme as theme } from './theme/theme';

// Types
export type { CardData } from './types/dashboard';