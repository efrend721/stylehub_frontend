import { useState } from 'react';

export const useAppBarSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSearch = () => {
    // Aquí se implementaría la lógica de búsqueda
    console.log('Searching for:', searchTerm);
  };

  return {
    searchTerm,
    drawerOpen,
    handleSearchChange,
    handleDrawerToggle,
    handleSearch,
  };
};