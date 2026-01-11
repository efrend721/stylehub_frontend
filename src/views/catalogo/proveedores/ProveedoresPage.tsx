import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MainCard from '#/ui-component/cards/MainCard';
import ProveedoresFiltersPopover, { type ProveedoresFilters } from './ProveedoresFiltersPopover';
import ProveedoresList from './ProveedoresList';
import { ProveedoresDeleteDialog } from './ProveedoresDeleteDialog';
import { ProveedoresEditDialog } from './ProveedoresEditDialog';
import { ProveedoresCreateDialog } from './ProveedoresCreateDialog';
import { useProveedores } from './useProveedores';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProveedoresHeaderCard from './ProveedoresHeaderCard';

export default function ProveedoresPage() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
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
    <>
      <ProveedoresHeaderCard
        mobileHeader={mobileHeader}
        landscapePhone={landscapePhone}
        searchValue={search}
        onSearchChange={setSearch}
        onOpenFilters={(anchor) => setFiltersAnchor(anchor)}
        onAdd={openCreateDialog}
      />

      <MainCard sx={{ mt: 0.5 }}>
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
            <ProveedoresList items={rows} onEdit={openEditFor} onAskDelete={(id) => openConfirmFor([id])} />
            {emptyHint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {emptyHint}
              </Typography>
            )}
          </Box>
        )}
      </MainCard>

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
    </>
  );
}
