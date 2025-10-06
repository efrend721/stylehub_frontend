import { styled } from '@mui/material/styles';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

const drawerWidth = 240;

export const StyledDrawer = styled(Drawer)(() => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const StyledList = styled(List)(() => ({
  padding: 0,
}));

export const StyledListItem = styled(ListItem)(() => ({
  padding: 0,
}));

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  minHeight: 48,
  padding: theme.spacing(0, 2.5),
}));

export const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 0,
  marginRight: theme.spacing(3),
  justifyContent: 'center',
}));

export const StyledListItemText = styled(ListItemText)(() => ({
  opacity: 1,
}));