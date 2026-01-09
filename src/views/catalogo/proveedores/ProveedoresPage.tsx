import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { IconPlus } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import SearchField from '#/ui-component/SearchField';
import FilterToggle from '#/ui-component/FilterToggle';
import ProveedoresFiltersPopover, { type ProveedoresFilters } from './ProveedoresFiltersPopover';
import ProveedoresList from './ProveedoresList';
import { ProveedoresDeleteDialog } from './ProveedoresDeleteDialog';
import { ProveedoresEditDialog } from './ProveedoresEditDialog';
import { ProveedoresCreateDialog } from './ProveedoresCreateDialog';
import { useProveedores } from './useProveedores';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ProveedoresPage() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const landscapePhone = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const mobileHeader = downSm || landscapePhone;

  const {
    rows,
    loading,
    error,
    confirmOpen,
    setConfirmOpen,
    deleteIds,
    openConfirmFor,
    doBulkDelete,
    deleting,
    editItem,
    setEditItem,
    openEditFor,
    saveEdit,
    saving,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createProveedor,
    creating,
    createFieldErrors,
    editFieldErrors,
    emptyHint,
    searchProveedores
  } = useProveedores();

  const [search, setSearch] = useState('');
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<ProveedoresFilters>({ estado: 'todos' });

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const searchRef = useRef('');
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const [searchParams, setSearchParams] = useSearchParams();


  // Initialize search/filters from URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const estadoParam = searchParams.get('estado');
    setSearch(q);
    setFilters({
      estado: estadoParam === 'activos' || estadoParam === 'inactivos' || estadoParam === 'todos' ? estadoParam : 'todos'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to URL on changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search.trim() !== '') params.q = search.trim();
    if (filters.estado !== 'todos') params.estado = String(filters.estado);
    setSearchParams(params, { replace: true });
  }, [search, filters, setSearchParams]);

  // Debounce 500ms para cambios en el texto
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const q = search.trim();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (q === '') {
      void searchProveedores('', filtersRef.current);
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      void searchProveedores(q, filtersRef.current);
    }, 500);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search, searchProveedores]);

  // Efecto inmediato: cambios en filtros
  useEffect(() => {
    void searchProveedores(searchRef.current.trim(), filters);
  }, [filters, searchProveedores]);

  return (
    <MainCard
      title={
        mobileHeader ? (
          <Stack spacing={1} sx={{ width: '100%', alignItems: 'stretch' }}>
            <Typography variant="h5" sx={{ textAlign: 'center' }} noWrap>
              Gestión de Proveedores
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <SearchField value={search} onChange={setSearch} placeholder="Buscar proveedores" />
              </Box>
              <FilterToggle size="small" onClick={(e) => setFiltersAnchor(e.currentTarget as HTMLElement)} />
            </Stack>
            <Button
              variant="contained"
              size="small"
              sx={{ py: 0.75 }}
              onClick={openCreateDialog}
              startIcon={<IconPlus size="18" />}
            >
              Agregar Proveedor
            </Button>
          </Stack>
        ) : (
          'Gestión de Proveedores'
        )
      }
      secondary={
        mobileHeader ? undefined : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <SearchField value={search} onChange={setSearch} placeholder="Buscar proveedores" />
              <FilterToggle onClick={(e) => setFiltersAnchor(e.currentTarget as HTMLElement)} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
              <Button variant="contained" size="medium" sx={{ py: 0.75 }} onClick={openCreateDialog} startIcon={<IconPlus size="18" />}>
                Agregar Proveedor
              </Button>
            </Stack>
          </Stack>
        )
      }
      headerSX={{
        '& .MuiCardHeader-content': { width: '100%', overflow: 'visible' },
        ...(mobileHeader
          ? {
            py: 1,
            '& .MuiCardHeader-title': {
              width: '100%',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }
          : null)
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box>
          <ProveedoresList
            items={rows}
            onEdit={openEditFor}
            onAskDelete={(id) => openConfirmFor([id])}
          />
          {emptyHint && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{emptyHint}</Typography>
          )}
        </Box>
      )}

      <ProveedoresDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <ProveedoresEditDialog
        item={editItem}
        saving={saving}
        onClose={() => setEditItem(null)}
        onChange={(item) => setEditItem(item)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <ProveedoresCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(payload) => void createProveedor(payload)}
        fieldErrors={createFieldErrors}
      />

      <ProveedoresFiltersPopover
        anchorEl={filtersAnchor}
        open={!!filtersAnchor}
        onClose={() => setFiltersAnchor(null)}
        filters={filters}
        setFilters={setFilters}
        onClearFilters={() => setFilters({ estado: 'todos' })}
      />
    </MainCard>
  );
}
