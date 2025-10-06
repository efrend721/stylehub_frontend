import { Toolbar, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon } from '@mui/icons-material';
import { StyleHubLogo } from '../../../../common/components';
import { useAppBarSearch } from './AppBarWithSearch.logic';
import {
  StyledAppBar,
  SearchContainer,
  SearchIconWrapper,
  StyledInputBase,
} from './AppBarWithSearch.styles';

interface AppBarWithSearchProps {
  onMenuClick?: () => void;
}

export const AppBarWithSearch = ({ onMenuClick }: AppBarWithSearchProps) => {
  const { searchTerm, handleSearchChange, handleSearch } = useAppBarSearch();

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="abrir menú"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <StyleHubLogo color="inherit" size="medium" />
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <SearchContainer>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Buscar…"
            inputProps={{ 'aria-label': 'buscar' }}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </SearchContainer>
      </Toolbar>
    </StyledAppBar>
  );
};