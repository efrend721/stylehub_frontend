import { useGetMenuMaster } from '#/api/menu';
import FilterToggle from '#/ui-component/FilterToggle';
import MainCard from '#/ui-component/cards/MainCard';
import SearchField from '#/ui-component/SearchField';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { forwardRef } from 'react';

export type ProductosHeaderCardProps = {
  mobileHeader: boolean;
  landscapePhone?: boolean;

  searchValue: string;
  onSearchChange: (value: string) => void;

  onOpenFilters: (anchor: HTMLElement) => void;
  onAdd: () => void;
};

const ProductosHeaderCard = forwardRef<HTMLDivElement, ProductosHeaderCardProps>(
  ({ mobileHeader, landscapePhone = false, searchValue, onSearchChange, onOpenFilters, onAdd }, ref) => {
    const { menuMaster } = useGetMenuMaster();
    const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;

    // Reducción de altura en inputs para ganar píxeles verticales
    const compactControlSx = { py: landscapePhone ? 0.4 : 0.75 } as const;
    const compactSearchSx = {
      '& .MuiOutlinedInput-input': { py: landscapePhone ? 0.4 : 0.75 }
    } as const;

    // Ajuste dinámico del buscador
    const landscapeSearchSx = Object.assign({}, compactSearchSx, {
      flexGrow: 1,
      minWidth: drawerOpen ? 120 : 180,
      maxWidth: drawerOpen ? 250 : 400
    });

    const headerSX: Record<string, unknown> = {
      '& .MuiCardHeader-content': { width: '100%', overflow: 'visible' },
      // Reducción drástica de padding en la tarjeta madre cuando es landscape
      p: landscapePhone ? 0.75 : 2
    };

    if (mobileHeader && !landscapePhone) {
      Object.assign(headerSX, {
        py: 1,
        '& .MuiCardHeader-title': {
          width: '100%',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      });
    }

    return (
      <MainCard
        ref={ref}
        content={false}
        title={
          mobileHeader ? (
            landscapePhone ? (
              // MODO LANDSCAPE: Todo en una sola fila para ahorrar altura
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', px: 0.5 }}>
                <Typography variant="h6" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                  Productos
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                  <SearchField value={searchValue} onChange={onSearchChange} placeholder="Buscar..." sx={landscapeSearchSx} />
                </Box>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <FilterToggle
                    size="small"
                    sx={compactControlSx}
                    onClick={(e) => onOpenFilters(e.currentTarget as HTMLElement)}
                  />
                  <Button variant="contained" size="small" sx={{ ...compactControlSx, whiteSpace: 'nowrap' }} onClick={onAdd}>
                    + Nuevo
                  </Button>
                </Stack>
              </Stack>
            ) : (
              // MODO PORTRAIT: Se mantiene apilado para evitar romper el ancho
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="h5" sx={{ textAlign: 'center' }} noWrap>
                  Gestión de Productos
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <SearchField value={searchValue} onChange={onSearchChange} placeholder="Buscar productos" sx={compactSearchSx} />
                  </Box>
                  <FilterToggle size="small" sx={compactControlSx} onClick={(e) => onOpenFilters(e.currentTarget as HTMLElement)} />
                </Stack>
                <Button variant="contained" size="small" sx={compactControlSx} onClick={onAdd}>
                  + agregar Producto
                </Button>
              </Stack>
            )
          ) : (
            'Gestión de Productos'
          )
        }
        secondary={
          mobileHeader ? undefined : (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <SearchField value={searchValue} onChange={onSearchChange} placeholder="Buscar productos" sx={compactSearchSx} />
                <FilterToggle onClick={(e) => onOpenFilters(e.currentTarget as HTMLElement)} />
              </Stack>
              <Button variant="contained" size="medium" sx={{ py: 0.75, mt: { xs: 1, sm: 0 } }} onClick={onAdd}>
                + agregar Producto
              </Button>
            </Stack>
          )
        }
        headerSX={headerSX}
      >
        {null}
      </MainCard>
    );
  }
);

ProductosHeaderCard.displayName = 'ProductosHeaderCard';

export default ProductosHeaderCard;
