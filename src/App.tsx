import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './redux/store';
import { DashboardLayout, DashboardContent, ModalProvider, NotificationProvider } from './components';
import { appTheme } from './theme/theme';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <DashboardLayout>
          <DashboardContent />
        </DashboardLayout>
        <ModalProvider />
        <NotificationProvider />
      </ThemeProvider>
    </Provider>
  );
};

export default App;