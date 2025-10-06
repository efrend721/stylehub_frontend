import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AppBarWithSearch } from './AppBarWithSearch/index.js';
import { PersistentDrawer } from './PersistentDrawer/index.js';
import { MainContent } from './MainContent.js';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBarWithSearch onMenuClick={handleDrawerOpen} />
      
      <PersistentDrawer 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
      />
      
      <Main open={drawerOpen}>
        <DrawerHeader />
        <MainContent />
      </Main>
    </Box>
  );
};