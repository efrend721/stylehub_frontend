import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { appTheme } from './theme/theme';
import { DashboardLayout } from './components/layout';
import { DashboardContent } from './components/dashboard';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ThemeProvider>
  );
};

export default App;