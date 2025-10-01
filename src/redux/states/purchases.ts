import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Purchase {
  id: string;
  productName: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  category: string;
}

export interface PurchasesState {
  purchases: Purchase[];
  totalSpent: number;
  monthlySummary: {
    month: string;
    total: number;
    count: number;
  }[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PurchasesState = {
  purchases: [],
  totalSpent: 0,
  monthlySummary: [],
  isLoading: false,
  error: null,
};

export const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    setPurchases: (state, action: PayloadAction<Purchase[]>) => {
      state.purchases = action.payload;
      state.totalSpent = action.payload.reduce((total, purchase) => total + purchase.amount, 0);
    },
    addPurchase: (state, action: PayloadAction<Purchase>) => {
      state.purchases.push(action.payload);
      state.totalSpent += action.payload.amount;
    },
    updatePurchase: (state, action: PayloadAction<{ id: string; updates: Partial<Purchase> }>) => {
      const { id, updates } = action.payload;
      const index = state.purchases.findIndex(p => p.id === id);
      if (index !== -1) {
        const oldAmount = state.purchases[index].amount;
        state.purchases[index] = { ...state.purchases[index], ...updates };
        if (updates.amount !== undefined) {
          state.totalSpent = state.totalSpent - oldAmount + updates.amount;
        }
      }
    },
    deletePurchase: (state, action: PayloadAction<string>) => {
      const purchase = state.purchases.find(p => p.id === action.payload);
      if (purchase) {
        state.totalSpent -= purchase.amount;
        state.purchases = state.purchases.filter(p => p.id !== action.payload);
      }
    },
    setMonthlySummary: (state, action: PayloadAction<PurchasesState['monthlySummary']>) => {
      state.monthlySummary = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPurchases,
  addPurchase,
  updatePurchase,
  deletePurchase,
  setMonthlySummary,
  setLoading,
  setError,
} = purchasesSlice.actions;

export default purchasesSlice.reducer;