import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import SearchField from '#/ui-component/SearchField';
import FilterToggle from '#/ui-component/FilterToggle';
import { UsuariosTable } from './UsuariosTable';
import { UsuariosDeleteDialog } from './UsuariosDeleteDialog';
import { UsuariosEditDialog } from './UsuariosEditDialog';
import { UsuariosCreateDialog } from './UsuariosCreateDialog';
import { useUsuarios } from './useUsuarios';
import type { GridRowSelectionModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import UsuariosFiltersPopover, { type UsuariosFilters } from './UsuariosFiltersPopover';
import { useEstablecimientos } from './useEstablecimientos';

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState('');
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<UsuariosFilters>({
    est: ''
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { establecimientos } = useEstablecimientos();

  const {
    rows,
    loading,
    error,
    emptyHint,
    selectionModel,
    setSelectionModel,
    selectedIds,
    confirmOpen,
    setConfirmOpen,
    deleteIds,
    openConfirmFor,
    doBulkDelete,
    deleting,
    editUser,
    setEditUser,
    openEditFor,
    saveEdit,
    saving,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createUser,
    creating,
    fetchUsuarios,
    refreshList,
    searchUsuarios,
    createFieldErrors,
    editFieldErrors
  } = useUsuarios();

  // Initialize from URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const est = searchParams.get('est') || '';
    setSearch(q);
    setFilters({ est });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParamsObj = useMemo(() => {
    return {
      est: filters.est || undefined,
      q: search.trim() || undefined
    };
  }, [filters, search]);

  const searchRef = useRef('');
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void searchUsuarios(searchParamsObj);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchUsuarios]);

  // Efecto inmediato para cambios en filtros (incluye búsqueda vacía)
  useEffect(() => {
    void searchUsuarios({ est: filters.est || undefined, q: searchRef.current.trim() || undefined });
  }, [filters, searchUsuarios]);

  // Sync to URL on changes
  useEffect(() => {
    const next: Record<string, string> = {};
    if (search.trim() !== '') next.q = search.trim();
    if (filters.est.trim() !== '') next.est = filters.est.trim();
    setSearchParams(next, { replace: true });
  }, [search, filters, setSearchParams]);

  return (
    <MainCard
      title="Gestión de Usuarios"
      secondary={
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <SearchField value={search} onChange={setSearch} placeholder="Buscar usuarios" />
            <FilterToggle onClick={(e) => setFiltersAnchor(e.currentTarget as HTMLElement)} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refrescar">
              <span>
                <IconButton onClick={() => void refreshList()} disabled={loading} color="secondary">
                  <IconRefresh size={20} />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              onClick={openCreateDialog}
              startIcon={<IconPlus size="18" />}
            >
              Agregar Usuario
            </Button>
          </Stack>
        </Stack>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography>{emptyHint ?? 'No hay usuarios.'}</Typography>
        </Box>
      ) : (
        <UsuariosTable
          rows={rows}
          selectedIds={selectedIds}
          deleting={deleting}
          selectionModel={selectionModel}
          onSelectionModelChange={(m: GridRowSelectionModel) => setSelectionModel(m)}
          onAskDelete={openConfirmFor}
          onEdit={openEditFor}
        />
      )}

      <UsuariosDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <UsuariosEditDialog
        user={editUser}
        saving={saving}
        onClose={() => setEditUser(null)}
        onChange={(u) => setEditUser(u)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <UsuariosCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(usuario) => void createUser(usuario)}
        fieldErrors={createFieldErrors}
      />

      <UsuariosFiltersPopover
        anchorEl={filtersAnchor}
        open={!!filtersAnchor}
        onClose={() => setFiltersAnchor(null)}
        filters={filters}
        setFilters={setFilters}
        establecimientos={establecimientos}
      />
    </MainCard>
  );
}
