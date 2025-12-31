import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { useUserManagement } from '#/views/admin/usuarios/hooks/useUserManagement';
import { ProductosService, TiposProductoService, CategoriasProductoService, ProveedoresService } from '#/services';
import { notify } from '#/utils/notify';
import { getErrorMessage, getErrorStatus, getErrorArray } from '#/utils/errorUtils';
import type { Producto, CreateProductoPayload, UpdateProductoPayload, Option } from './types';
import type { ProductosFilters } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

function fieldErrorsFromArray(arr: Array<{ path?: string[]; message?: string }>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of arr) {
    const field = Array.isArray(e.path) ? e.path[0] : undefined;
    const msg = typeof e.message === 'string' ? e.message : undefined;
    if (field && msg) out[field] = msg;
  }
  return out;
}

export function useProductos() {
  const { user } = useAuth();
  const { idEstablecimiento, attachEstablecimiento } = useUserManagement();

  const [rows, setRows] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyHint, setEmptyHint] = useState<string | null>(null);

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const selectedIds = useMemo<GridRowId[]>(() => {
    const ids = selectionModel.ids as unknown;
    if (ids instanceof Set) return Array.from(ids) as GridRowId[];
    if (Array.isArray(ids)) return ids as GridRowId[];
    return [] as GridRowId[];
  }, [selectionModel]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const [editItem, setEditItem] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  // Options for selects
  const [tipoOptions, setTipoOptions] = useState<Option<number>[]>([]);
  const [categoriaOptions, setCategoriaOptions] = useState<Option<string>[]>([]);
  const [proveedorOptions, setProveedorOptions] = useState<Option<number>[]>([]);

  const loadOptions = useCallback(async () => {
    try {
      const [tipos, categorias, proveedores] = await Promise.all([
        TiposProductoService.getOptions(),
        CategoriasProductoService.getOptions(),
        ProveedoresService.getOptions(1)
      ]);
      setTipoOptions(tipos);
      setCategoriaOptions(categorias);
      setProveedorOptions(proveedores);
    } catch {
      notify.warning('No se pudieron cargar opciones de tipo/categoría/proveedor');
    }
  }, []);

  const searchProveedorOptions = useCallback(async (query: string) => {
    try {
      const q = query.trim();
      if (!q) {
        const defaults = await ProveedoresService.getOptions(1);
        setProveedorOptions(defaults);
        return;
      }
      const results = await ProveedoresService.search(q);
      const mapped: Option<number>[] = (results || []).map((p) => ({ value: p.id_proveedor, label: p.nombre_proveedor }));
      setProveedorOptions(mapped);
    } catch {
      // mantener opciones actuales en caso de error
    }
  }, []);

  // Debounce de 500ms para búsqueda de proveedor
  const proveedorSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearchProveedorOptions = useMemo(() => {
    return (query: string) => {
      if (proveedorSearchDebounceRef.current) clearTimeout(proveedorSearchDebounceRef.current);
      proveedorSearchDebounceRef.current = setTimeout(() => {
        void searchProveedorOptions(query);
      }, 500);
    };
  }, [searchProveedorOptions]);

  useEffect(() => {
    return () => {
      if (proveedorSearchDebounceRef.current) clearTimeout(proveedorSearchDebounceRef.current);
    };
  }, []);

  const fetchProductos = useCallback(async () => {
    if (!idEstablecimiento) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ProductosService.getByEstablecimiento(idEstablecimiento);
      setRows(Array.isArray(data) ? data : []);
      setEmptyHint(null);
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'No se pudo cargar productos');
      if (status === 404) {
        notify.info(msg || 'No se encontraron productos para tu establecimiento');
        setRows([]);
        setError(null);
        setEmptyHint('No se encontraron productos para tu establecimiento');
      } else {
        setError(msg);
        setEmptyHint(null);
      }
    } finally {
      setLoading(false);
    }
  }, [idEstablecimiento]);

  useEffect(() => {
    void loadOptions();
    // Estado inicial vacío: no cargar productos por defecto
    setRows([]);
    setEmptyHint('Escribe para buscar');
    setLoading(false);
  }, [loadOptions]);

  // No cargar productos automáticamente; se hará bajo demanda (búsqueda)

  const searchProductos = useCallback(async (query?: string, filters?: ProductosFilters) => {
    if (!idEstablecimiento) return;
    const q = (query ?? '').trim();
    const hasFilters = !!filters && (
      (filters.id_tipo != null && filters.id_tipo !== '') ||
      (filters.id_categoria != null && filters.id_categoria !== '') ||
      (filters.id_proveedor != null && filters.id_proveedor !== '') ||
      (filters.precio_min != null && filters.precio_min.trim() !== '') ||
      (filters.precio_max != null && filters.precio_max.trim() !== '') ||
      (filters.costo_min != null && filters.costo_min.trim() !== '') ||
      (filters.costo_max != null && filters.costo_max.trim() !== '')
    );
    if (q === '' && !hasFilters) {
      setRows([]);
      setEmptyHint('Escribe para buscar');
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ProductosService.search({
        q: q || undefined,
        est: idEstablecimiento,
        tipo: filters && filters.id_tipo != null && filters.id_tipo !== '' ? Number(filters.id_tipo) : undefined,
        categoria: filters && filters.id_categoria != null && filters.id_categoria !== '' ? String(filters.id_categoria) : undefined,
        proveedor: filters && filters.id_proveedor != null && filters.id_proveedor !== '' ? Number(filters.id_proveedor) : undefined,
        pmin: filters && filters.precio_min.trim() !== '' ? Number(filters.precio_min) : undefined,
        pmax: filters && filters.precio_max.trim() !== '' ? Number(filters.precio_max) : undefined,
        cmin: filters && filters.costo_min.trim() !== '' ? Number(filters.costo_min) : undefined,
        cmax: filters && filters.costo_max.trim() !== '' ? Number(filters.costo_max) : undefined
      });
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setEmptyHint(list.length === 0 ? 'Sin resultados para tu búsqueda' : null);
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo buscar productos');
      setError(msg);
      setRows([]);
      setEmptyHint(null);
    } finally {
      setLoading(false);
    }
  }, [idEstablecimiento]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map((x) => Number(x)).filter((n) => !Number.isNaN(n)));
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      for (const id of deleteIds) {
        try { await ProductosService.deleteOne(id); } catch {}
      }
      notify.success('Producto(s) eliminado(s)');
      await fetchProductos();
      setSelectionModel(EMPTY_SELECTION);
      setDeleteIds([]);
    } catch (e) {
      const msg = getErrorMessage(e, 'Error al eliminar productos');
      notify.error(msg);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openEditFor = (item: Producto) => {
    setEditItem(item);
    setEditFieldErrors({});
  };

  const saveEdit = async (payload: UpdateProductoPayload) => {
    if (!editItem) return;
    setSaving(true);
    try {
      setEditFieldErrors({});
      await ProductosService.update(editItem.id_producto, payload);
      notify.success('Producto actualizado');
      setEditItem(null);
      await fetchProductos();
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'No se pudo actualizar el producto');
      if (status === 422) {
        const errs = getErrorArray(e);
        if (errs.length > 0) {
          const fieldMap = fieldErrorsFromArray(errs.map((x) => ({ path: x.path, message: x.message })));
          setEditFieldErrors(fieldMap);
          const messages = errs.map((it) => it.message).filter((m): m is string => !!m);
          notify.warning(messages.join('\n'));
        } else {
          notify.warning(msg);
        }
      } else {
        notify.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const createItem = async (nuevo: Omit<CreateProductoPayload, 'id_establecimiento'>) => {
    if (!idEstablecimiento) {
      notify.error('No se encontró establecimiento en sesión');
      return;
    }
    setCreating(true);
    try {
      const payload = attachEstablecimiento({ ...nuevo, id_establecimiento: undefined });
      setCreateFieldErrors({});
      await ProductosService.create(payload as CreateProductoPayload);
      notify.success('Producto creado exitosamente');
      setCreateDialogOpen(false);
      await fetchProductos();
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'No se pudo crear el producto');
      if (status === 422) {
        const errs = getErrorArray(e);
        if (errs.length > 0) {
          const fieldMap = fieldErrorsFromArray(errs.map((x) => ({ path: x.path, message: x.message })));
          setCreateFieldErrors(fieldMap);
          const messages = errs.map((it) => it.message).filter((m): m is string => !!m);
          notify.warning(messages.join('\n'));
        } else {
          notify.warning(msg);
        }
      } else {
        notify.error(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
    setCreateFieldErrors({});
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const closeEdit = () => setEditItem(null);

  return {
    user,
    idEstablecimiento,
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
    searchProveedorOptions: debouncedSearchProveedorOptions,
    fetchProductos,
    searchProductos
  };
}
