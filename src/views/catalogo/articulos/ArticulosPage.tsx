import MainCard from '#/ui-component/cards/MainCard';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArticulosFiltersPopover from './ArticulosFiltersPopover';
import type { ArticulosFilters } from './types';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { ArticulosTable } from './ArticulosTable';
import ArticulosList from './ArticulosList';
import ArticulosHeaderCard from './ArticulosHeaderCard';
import { ArticulosCreateDialog } from './ArticulosCreateDialog';
import { ArticulosEditDialog } from './ArticulosEditDialog';
import { ArticulosDeleteDialog } from './ArticulosDeleteDialog';
import { useArticulos } from './useArticulos';
import { hasResourceActionScope } from '#/utils/auth/scopeUtils';

export default function ArticulosPage() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  // Muchos teléfonos en landscape superan el breakpoint md (p.ej. 932px),
  // así que usamos altura baja para detectar "celular rotado".
  const landscapePhone = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const mobileHeader = downSm || landscapePhone;

  const cardRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState('');
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [filtersPopoverWidth, setFiltersPopoverWidth] = useState<number | null>(null);
  const [filters, setFilters] = useState<ArticulosFilters>({
    id_tipo: null,
    id_categoria: null,
    id_proveedor: null,
    precio_min: '',
    precio_max: '',
    costo_min: '',
    costo_max: ''
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user,
    rows,
    loading,
    error,
    emptyHint,
    confirmOpen,
    setConfirmOpen,
    deleteIds,
    openConfirmFor,
    doDelete,
    deleting,
    editItem,
    openEditFor,
    closeEdit,
    saveEdit,
    editFieldErrors,
    saving,

    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createItem,
    creating,
    createFieldErrors,

    tipoOptions,
    categoriaOptions,
    proveedorOptions,
    searchProveedorOptions,
    searchArticulos
  } = useArticulos();

  // Scopes: migración productos:* -> articulos:* (acepta ambos durante transición)
  const canCreate = hasResourceActionScope(user, ['articulos', 'productos'], 'create');
  const canEdit = hasResourceActionScope(user, ['articulos', 'productos'], 'update');
  const canDelete = hasResourceActionScope(user, ['articulos', 'productos'], 'delete');

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const searchRef = useRef('');
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Debounce de 500ms para cambios en el texto de búsqueda
  const articulosSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const q = search.trim();
    if (articulosSearchDebounceRef.current) clearTimeout(articulosSearchDebounceRef.current);
    if (q === '') {
      // no esperar: si no hay texto, delega a efecto inmediato de filtros
      void searchArticulos('', filtersRef.current);
      return;
    }
    articulosSearchDebounceRef.current = setTimeout(() => {
      void searchArticulos(q, filtersRef.current);
    }, 500);
    return () => {
      if (articulosSearchDebounceRef.current) clearTimeout(articulosSearchDebounceRef.current);
    };
  }, [search, searchArticulos]);

  // Efecto inmediato para cambios en filtros (incluye búsqueda vacía)
  useEffect(() => {
    void searchArticulos(searchRef.current.trim(), filters);
  }, [filters, searchArticulos]);

  // Initialize filters and search from URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo');
    const categoria = searchParams.get('categoria');
    const proveedor = searchParams.get('proveedor');
    const pmin = searchParams.get('pmin') || '';
    const pmax = searchParams.get('pmax') || '';
    const cmin = searchParams.get('cmin') || '';
    const cmax = searchParams.get('cmax') || '';
    setSearch(q);
    setFilters({
      id_tipo: tipo == null || tipo === '' ? null : Number(tipo),
      id_categoria: categoria == null || categoria === '' ? null : String(categoria),
      id_proveedor: proveedor == null || proveedor === '' ? null : Number(proveedor),
      precio_min: pmin,
      precio_max: pmax,
      costo_min: cmin,
      costo_max: cmax
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to URL on changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search.trim() !== '') params.q = search.trim();
    if (filters.id_tipo != null && filters.id_tipo !== '') params.tipo = String(filters.id_tipo);
    if (filters.id_categoria != null && filters.id_categoria !== '') params.categoria = String(filters.id_categoria);
    if (filters.id_proveedor != null && filters.id_proveedor !== '') params.proveedor = String(filters.id_proveedor);
    if (filters.precio_min.trim() !== '') params.pmin = filters.precio_min.trim();
    if (filters.precio_max.trim() !== '') params.pmax = filters.precio_max.trim();
    if (filters.costo_min.trim() !== '') params.cmin = filters.costo_min.trim();
    if (filters.costo_max.trim() !== '') params.cmax = filters.costo_max.trim();
    setSearchParams(params, { replace: true });
  }, [search, filters, setSearchParams]);

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
      <ArticulosHeaderCard
        ref={cardRef}
        mobileHeader={mobileHeader}
        landscapePhone={landscapePhone}
        canCreate={canCreate}
        searchValue={search}
        onSearchChange={setSearch}
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
            <ArticulosList
              items={rows}
              onEdit={openEditFor}
              onAskDelete={(id) => openConfirmFor([id])}
              canEdit={canEdit}
              canDelete={canDelete}
            />
            {emptyHint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {emptyHint}
              </Typography>
            )}
          </Box>
        )}
      </MainCard>

      <ArticulosCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={createItem}
        fieldErrors={createFieldErrors}
        tipoOptions={tipoOptions}
        categoriaOptions={categoriaOptions}
        proveedorOptions={proveedorOptions}
        onSearchProveedor={searchProveedorOptions}
      />

      <ArticulosEditDialog
        item={editItem}
        saving={saving}
        onClose={closeEdit}
        onSave={saveEdit}
        fieldErrors={editFieldErrors}
        tipoOptions={tipoOptions}
        categoriaOptions={categoriaOptions}
        proveedorOptions={proveedorOptions}
        onSearchProveedor={searchProveedorOptions}
      />

      <ArticulosDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <ArticulosFiltersPopover
        anchorEl={filtersAnchor}
        open={!!filtersAnchor}
        onClose={() => setFiltersAnchor(null)}
        filters={filters}
        setFilters={setFilters}
        paperSx={downSm && filtersPopoverWidth ? { width: filtersPopoverWidth, maxWidth: 'none' } : undefined}
        onClearFilters={() =>
          setFilters({
            id_tipo: null,
            id_categoria: null,
            id_proveedor: null,
            precio_min: '',
            precio_max: '',
            costo_min: '',
            costo_max: ''
          })
        }
        tipoOptions={tipoOptions}
        categoriaOptions={categoriaOptions}
        proveedorOptions={proveedorOptions}
        onSearchProveedor={searchProveedorOptions}
      />
    </>
  );
}
