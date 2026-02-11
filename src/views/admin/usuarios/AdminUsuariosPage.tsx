import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MainCard from '#/ui-component/cards/MainCard';
import { UsuariosDeleteDialog } from './UsuariosDeleteDialog';
import { UsuariosEditDialog } from './UsuariosEditDialog';
import { UsuariosCreateDialog } from './UsuariosCreateDialog';
import { useUsuarios } from './useUsuarios';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import UsuariosFiltersPopover, { type UsuariosFilters } from './UsuariosFiltersPopover';
import { useEstablecimientos } from './useEstablecimientos';
import { useRoles } from './useRoles';
import UsuariosHeaderCard from './UsuariosHeaderCard';
import UsuariosList from './UsuariosList';
import { useAuth } from '#/contexts/AuthContext';
import { hasRole } from '#/utils/auth/roleUtils';
import type { UsuariosSearchEstado } from '#/services/usuarios/usuariosService';

const ESTADOS_VALIDOS = ['0', '1', 'all', '*'] as const;
function parseEstado(value: string | null): UsuariosSearchEstado | undefined {
  if (!value) return undefined;
  if ((ESTADOS_VALIDOS as readonly string[]).includes(value)) return value as UsuariosSearchEstado;
  return undefined;
}

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const isRole2 = hasRole(user, 2);
  const defaultEstado: UsuariosSearchEstado | undefined = undefined;

  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const landscapePhone = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const mobileHeader = downSm || landscapePhone;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const userInteractedRef = useRef(false);

  const [search, setSearch] = useState('');
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<UsuariosFilters>({
    est: '',
    rol: null,
    estado: defaultEstado
  });

  const setFiltersFromUI = (next: UsuariosFilters) => {
    userInteractedRef.current = true;
    setFilters(next);
  };
  const [filtersPopoverWidth, setFiltersPopoverWidth] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { establecimientos } = useEstablecimientos();
  const { roles } = useRoles();

  const {
    rows,
    loading,
    error,
    emptyHint,
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
    searchUsuarios,
    clearSearchUI,
    createFieldErrors,
    editFieldErrors
  } = useUsuarios();

  const clearAllFiltersAndSearch = () => {
    userInteractedRef.current = false;
    setSearch('');
    setFilters({ est: '', rol: null, estado: defaultEstado });
    setFiltersAnchor(null);
    setSearchParams({}, { replace: true });
    clearSearchUI();
  };

  // Initialize from URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const est = isRole2 ? '' : (searchParams.get('est') || '');
    const rol = searchParams.get('rol');
    const estadoParam = searchParams.get('estado');
    const estado = parseEstado(estadoParam) ?? defaultEstado;

    const hasEstadoParam = estadoParam != null && estadoParam !== '';

    const hasNonDefaultFromUrl =
      q.trim() !== '' ||
      (!isRole2 && est.trim() !== '') ||
      (rol != null && rol !== '') ||
      hasEstadoParam;
    userInteractedRef.current = hasNonDefaultFromUrl;

    setSearch(q);
    setFilters({
      est,
      rol: rol == null || rol === '' ? null : Number(rol),
      estado
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEstado, isRole2]);

  const searchRef = useRef('');
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const q = search.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const isDefaultQuery =
      q === '' &&
      (!filtersRef.current.rol) &&
      (filtersRef.current.estado === defaultEstado) &&
      (isRole2 ? true : (filtersRef.current.est.trim() === ''));

    if (!userInteractedRef.current && isDefaultQuery) {
      return;
    }

    if (q === '') {
      void searchUsuarios({
        est: isRole2 ? undefined : (filtersRef.current.est || undefined),
        q: undefined,
        rol: filtersRef.current.rol ?? undefined,
        estado: filtersRef.current.estado
      });
      return;
    }
    debounceRef.current = setTimeout(() => {
      void searchUsuarios({
        est: isRole2 ? undefined : (filtersRef.current.est || undefined),
        q: q || undefined,
        rol: filtersRef.current.rol ?? undefined,
        estado: filtersRef.current.estado
      });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, defaultEstado, isRole2, searchUsuarios]);

  // Efecto inmediato para cambios en filtros (incluye búsqueda vacía)
  useEffect(() => {
    const q = searchRef.current.trim();
    const isDefaultQuery =
      q === '' &&
      (!filters.rol) &&
      (filters.estado === defaultEstado) &&
      (isRole2 ? true : (filters.est.trim() === ''));

    if (!userInteractedRef.current && isDefaultQuery) {
      return;
    }

    void searchUsuarios({
      est: isRole2 ? undefined : (filters.est || undefined),
      q: q || undefined,
      rol: filters.rol ?? undefined,
      estado: filters.estado
    });
  }, [filters, defaultEstado, isRole2, searchUsuarios]);

  // Sync to URL on changes
  useEffect(() => {
    const isDefaultQuery =
      search.trim() === '' &&
      (!filters.rol) &&
      (filters.estado === defaultEstado) &&
      (isRole2 ? true : (filters.est.trim() === ''));

    if (!userInteractedRef.current && isDefaultQuery) {
      setSearchParams({}, { replace: true });
      return;
    }

    const next: Record<string, string> = {};
    if (search.trim() !== '') next.q = search.trim();
    if (!isRole2 && filters.est.trim() !== '') next.est = filters.est.trim();
    if (filters.rol != null) next.rol = String(filters.rol);
    if (filters.estado) next.estado = String(filters.estado);
    setSearchParams(next, { replace: true });
  }, [search, filters, defaultEstado, isRole2, setSearchParams]);

  const openFiltersPopover = (anchor: HTMLElement) => {
    setFiltersAnchor(anchor);
    if (mobileHeader && cardRef.current) {
      setFiltersPopoverWidth(Math.round(cardRef.current.getBoundingClientRect().width));
    } else {
      setFiltersPopoverWidth(null);
    }
  };

  useEffect(() => {
    if (!mobileHeader) {
      setFiltersPopoverWidth(null);
      return;
    }
    if (filtersAnchor && cardRef.current) {
      setFiltersPopoverWidth(Math.round(cardRef.current.getBoundingClientRect().width));
    }
  }, [mobileHeader, filtersAnchor]);

  return (
    <>
      <UsuariosHeaderCard
        ref={cardRef}
        mobileHeader={mobileHeader}
        landscapePhone={landscapePhone}
        searchValue={search}
        onSearchChange={(v) => {
          userInteractedRef.current = true;
          setSearch(v);
        }}
        onOpenFilters={openFiltersPopover}
        onAdd={openCreateDialog}
      />

      <MainCard sx={{ mt: 0.5 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <CircularProgress />
          </Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box>
            <UsuariosList items={rows} onEdit={openEditFor} onAskDelete={(id) => openConfirmFor([id])} />
            {emptyHint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {emptyHint}
              </Typography>
            )}
          </Box>
        )}
      </MainCard>

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
        setFilters={setFiltersFromUI}
        establecimientos={establecimientos}
        roles={roles}
        hideEstablecimiento={isRole2}
        onClear={clearAllFiltersAndSearch}
        paperSx={downSm && filtersPopoverWidth ? { width: filtersPopoverWidth, maxWidth: 'none' } : undefined}
      />
    </>
  );
}
