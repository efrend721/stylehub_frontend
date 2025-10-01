import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './states/navigation';
import authReducer from './states/auth';
import purchasesReducer from './states/purchases';
import dashboardReducer from './states/dashboard';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    auth: authReducer,
    purchases: purchasesReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;