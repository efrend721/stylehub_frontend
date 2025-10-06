import { IconButton, Divider } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  ContentCut as ContentCutIcon,
  Spa as SpaIcon,
  CalendarToday as CalendarTodayIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import {
  StyledDrawer,
  DrawerHeader,
  StyledList,
  StyledListItem,
  StyledListItemButton,
  StyledListItemIcon,
  StyledListItemText,
} from './PersistentDrawer.styles';

interface PersistentDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Citas', icon: <CalendarTodayIcon />, path: '/appointments' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
  { text: 'Servicios', icon: <ContentCutIcon />, path: '/services' },
  { text: 'Tratamientos Spa', icon: <SpaIcon />, path: '/spa-treatments' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Análisis', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
];

export const PersistentDrawer = ({ open, onClose }: PersistentDrawerProps) => {
  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader>
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      
      <Divider />
      
      <StyledList>
        {menuItems.map((item) => (
          <StyledListItem key={item.text} disablePadding>
            <StyledListItemButton>
              <StyledListItemIcon>
                {item.icon}
              </StyledListItemIcon>
              <StyledListItemText primary={item.text} />
            </StyledListItemButton>
          </StyledListItem>
        ))}
      </StyledList>
    </StyledDrawer>
  );
};