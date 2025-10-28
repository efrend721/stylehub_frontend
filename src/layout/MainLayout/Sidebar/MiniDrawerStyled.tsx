// material-ui
import { styled, Theme } from '@mui/material/styles';
import Drawer /* , { DrawerProps } */ from '@mui/material/Drawer';

// project imports
import { drawerWidth } from '#/store/constant';

// Interface for future use if needed (currently using inline type)
// interface MiniDrawerStyledProps extends DrawerProps {
//   open: boolean;
// }

function openedMixin(theme: Theme) {
  return {
    width: drawerWidth,
    borderRight: 'none',
    zIndex: 1099,
    background: theme.vars.palette.background.default,
    overflowX: 'hidden' as const,
    boxShadow: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen + 200
    })
  };
}

function closedMixin(theme: Theme) {
  return {
    borderRight: 'none',
    zIndex: 1099,
    background: theme.vars.palette.background.default,
    overflowX: 'hidden' as const,
    width: 72,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen + 200
    })
  };
}

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(({ theme, open }) => ({
  width: drawerWidth,
  borderRight: '0px',
  flexShrink: 0,
  whiteSpace: 'nowrap' as const,
  boxSizing: 'border-box' as const,
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

export default MiniDrawerStyled;
