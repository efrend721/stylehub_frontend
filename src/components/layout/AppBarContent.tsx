import React from 'react';
import {
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import { Search, SearchIconWrapper, StyledInputBase } from './SearchBar';

interface AppBarContentProps {
  open: boolean;
  onDrawerOpen: () => void;
  anchorEl: HTMLElement | null;
  mobileMoreAnchorEl: HTMLElement | null;
  onProfileMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMobileMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  menuId: string;
  mobileMenuId: string;
}

export const AppBarContent: React.FC<AppBarContentProps> = ({
  open,
  onDrawerOpen,
  onProfileMenuOpen,
  onMobileMenuOpen,
  menuId,
  mobileMenuId,
}) => {
  return (
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={onDrawerOpen}
        edge="start"
        sx={[
          {
            marginRight: 2,
          },
          open && { display: "none" },
        ]}
      >
        <MenuIcon />
      </IconButton>
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        StyleHub
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Buscar…"
          inputProps={{ "aria-label": "search" }}
        />
      </Search>
      <Box sx={{ display: { xs: "none", md: "flex" } }}>
        <IconButton
          size="large"
          aria-label="show 4 new mails"
          color="inherit"
        >
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={onProfileMenuOpen}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
      </Box>
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="show more"
          aria-controls={mobileMenuId}
          aria-haspopup="true"
          onClick={onMobileMenuOpen}
          color="inherit"
        >
          <MoreIcon />
        </IconButton>
      </Box>
    </Toolbar>
  );
};