import MainCard from '#/ui-component/cards/MainCard';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchField from '#/ui-component/SearchField';
import FilterToggle from '#/ui-component/FilterToggle';
import ProductosFiltersPopover from './ProductosFiltersPopover';
import type { ProductosFilters } from './types';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { ProductosTable } from './ProductosTable';
import ProductosList from './ProductosList';
import { ProductosCreateDialog } from './ProductosCreateDialog';
import { ProductosEditDialog } from './ProductosEditDialog';
import { ProductosDeleteDialog } from './ProductosDeleteDialog';
import { useProductos } from './useProductos';

export default function ProductosPage() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const cardRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState('');
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [filtersPopoverWidth, setFiltersPopoverWidth] = useState<number | null>(null);
  const [filters, setFilters] = useState<ProductosFilters>({
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
    searchProductos
  } = useProductos();

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const searchRef = useRef('');
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Debounce de 500ms para cambios en el texto de búsqueda
  const productSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const q = search.trim();
    if (productSearchDebounceRef.current) clearTimeout(productSearchDebounceRef.current);
    if (q === '') {
      // no esperar: si no hay texto, delega a efecto inmediato de filtros
      void searchProductos('', filtersRef.current);
      return;
    }
    productSearchDebounceRef.current = setTimeout(() => {
      void searchProductos(q, filtersRef.current);
    }, 500);
    return () => {
      if (productSearchDebounceRef.current) clearTimeout(productSearchDebounceRef.current);
    };
  }, [search, searchProductos]);

  // Efecto inmediato para cambios en filtros (incluye búsqueda vacía)
  useEffect(() => {
    void searchProductos(searchRef.current.trim(), filters);
  }, [filters, searchProductos]);

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
    if (downSm && cardRef.current) {
      setFiltersPopoverWidth(Math.round(cardRef.current.getBoundingClientRect().width));
    } else {
      setFiltersPopoverWidth(null);
    }
  };

  useEffect(() => {
    if (!downSm) {
      setFiltersPopoverWidth(null);
      return;
    }
    if (filtersAnchor && cardRef.current) {
      setFiltersPopoverWidth(Math.round(cardRef.current.getBoundingClientRect().width));
    }
  }, [downSm, filtersAnchor]);

  return (
    <MainCard
      ref={cardRef}
      title={
        downSm ? (
          <Stack spacing={1} sx={{ width: '100%', alignItems: 'stretch' }}>
            <Typography variant="h5" sx={{ textAlign: 'center' }}>
              Productos
            </Typography>
            <SearchField value={search} onChange={setSearch} placeholder="Buscar productos" />
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterToggle size="small" onClick={(e) => openFiltersPopover(e.currentTarget as HTMLElement)} />
              <Button
                variant="contained"
                size="small"
                sx={{ py: 0.75, flexGrow: 1 }}
                onClick={openCreateDialog}
              >
                + agregar Producto
              </Button>
            </Stack>
          </Stack>
        ) : (
          'Productos'
        )
      }
      secondary={
        downSm ? undefined : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <SearchField value={search} onChange={setSearch} placeholder="Buscar productos" />
              <FilterToggle onClick={(e) => openFiltersPopover(e.currentTarget as HTMLElement)} />
            </Stack>
            <Button variant="contained" size="medium" sx={{ py: 0.75, mt: { xs: 1, sm: 0 } }} onClick={openCreateDialog}>
              + agregar Producto
            </Button>
          </Stack>
        )
      }
      headerSX={{
        '& .MuiCardHeader-content': { width: '100%', overflow: 'visible' },
        ...(downSm
          ? {
            py: 1,
            '& .MuiCardHeader-title': { width: '100%' }
          }
          : null)
      }}
    >
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
        </Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box>
          <ProductosList
            items={rows}
            onEdit={openEditFor}
            onAskDelete={(id) => openConfirmFor([id])}
          />
          {emptyHint && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{emptyHint}</Typography>
          )}
        </Box>
      )}

      <ProductosCreateDialog
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

      <ProductosEditDialog
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

      <ProductosDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <ProductosFiltersPopover
        anchorEl={filtersAnchor}
        open={!!filtersAnchor}
        onClose={() => setFiltersAnchor(null)}
        filters={filters}
        setFilters={setFilters}
        paperSx={downSm && filtersPopoverWidth ? { width: filtersPopoverWidth, maxWidth: 'none' } : undefined}
        onClearFilters={() => setFilters({
          id_tipo: null,
          id_categoria: null,
          id_proveedor: null,
          precio_min: '',
          precio_max: '',
          costo_min: '',
          costo_max: ''
        })}
        tipoOptions={tipoOptions}
        categoriaOptions={categoriaOptions}
        proveedorOptions={proveedorOptions}
        onSearchProveedor={searchProveedorOptions}
      />
    </MainCard>
  );
}
