import { ThemeProvider, CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';
import { theme } from '../config/mui.config';
import { AuthProvider } from './AuthProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};