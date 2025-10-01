import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NavigationState {
  currentView: string;
  isLoading: boolean;
}

const initialState: NavigationState = {
  currentView: 'dashboard',
  isLoading: false,
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCurrentView, setLoading } = navigationSlice.actions;
export default navigationSlice.reducer;