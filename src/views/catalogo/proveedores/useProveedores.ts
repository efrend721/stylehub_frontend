import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProveedoresService } from '#/services';
import { notify } from '#/utils/notify';
import { getErrorMessage, getErrorStatus, getErrorArray } from '#/utils/errorUtils';
import type { Proveedor, CreateProveedorPayload, UpdateProveedorPayload } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import type { ProveedoresFilters } from './ProveedoresFiltersPopover';

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

export function useProveedores() {
  const [rows, setRows] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emptyHint, setEmptyHint] = useState<string | null>(null);

  const lastSearchRef = useRef<{ q: string; filters: ProveedoresFilters } | null>(null);

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const selectedIds = useMemo<GridRowId[]>(() => {
    const ids = selectionModel.ids as unknown;
    if (ids instanceof Set) return Array.from(ids) as GridRowId[];
    if (Array.isArray(ids)) return ids as GridRowId[];
    return [] as GridRowId[];
  }, [selectionModel]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const [editItem, setEditItem] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProveedoresService.getAll();
      setRows(Array.isArray(data) ? data : []);
      setEmptyHint(null);
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo cargar proveedores');
      setError(msg);
      setEmptyHint(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Estado inicial vacío: no cargar por defecto (igual que Productos)
    setRows([]);
    setEmptyHint('Escribe para buscar');
    setLoading(false);
  }, []);

  const searchProveedores = useCallback(async (query?: string, filters?: ProveedoresFilters) => {
    const q = (query ?? '').trim();
    const estado = filters?.estado ?? 'todos';
    const hasFilters = estado !== 'todos';

    lastSearchRef.current = { q, filters: filters ?? { estado: 'todos' } };

    if (q === '' && !hasFilters) {
      setRows([]);
      setEmptyHint('Escribe para buscar');
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ProveedoresService.search({
        nombre: q || undefined,
        estado,
        sort: 'nombre',
        order: 'asc'
      });
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setEmptyHint(list.length === 0 ? 'Sin resultados para tu búsqueda' : null);
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo buscar proveedores');
      setError(msg);
      setRows([]);
      setEmptyHint(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAfterMutation = useCallback(async () => {
    const last = lastSearchRef.current;
    if (!last) {
      setRows([]);
      setEmptyHint('Escribe para buscar');
      return;
    }
    await searchProveedores(last.q, last.filters);
  }, [searchProveedores]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map(Number));
    setConfirmOpen(true);
  };

  const doBulkDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      const { deleted, requested } = await ProveedoresService.deleteMultipleSoft(deleteIds);
      if (deleted === requested) {
        notify.success(`${deleted} proveedor(es) desactivado(s)`);
      } else {
        notify.error(`Desactivados ${deleted}/${requested}. Revise dependencias.`);
      }
      await refreshAfterMutation();
      setSelectionModel(EMPTY_SELECTION);
      setDeleteIds([]);
    } catch (e) {
      const msg = getErrorMessage(e, 'Error al desactivar proveedores');
      notify.error(msg);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openEditFor = (item: Proveedor) => {
    setEditItem({ ...item });
    setEditFieldErrors({});
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    setEditFieldErrors({});
    try {
      const { id_proveedor, ...rest } = editItem;
      const payload: UpdateProveedorPayload = { ...rest };
      await ProveedoresService.update(editItem.id_proveedor, payload);
      notify.success('Proveedor actualizado');
      setEditItem(null);
      await refreshAfterMutation();
    } catch (e) {
      const status = getErrorStatus(e);
      const errArr = getErrorArray(e);
      if (status === 422 && errArr.length > 0) {
        setEditFieldErrors(fieldErrorsFromArray(errArr));
        notify.warning('Revise los campos');
      } else {
        notify.error(getErrorMessage(e, 'Error al actualizar'));
      }
    } finally {
      setSaving(false);
    }
  };

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
    setCreateFieldErrors({});
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreateFieldErrors({});
  };

  const createProveedor = async (payload: CreateProveedorPayload) => {
    setCreating(true);
    setCreateFieldErrors({});
    try {
      await ProveedoresService.create({ ...payload, nombre_proveedor: payload.nombre_proveedor.trim() });
      notify.success('Proveedor creado');
      closeCreateDialog();
      await refreshAfterMutation();
    } catch (e) {
      const status = getErrorStatus(e);
      const errArr = getErrorArray(e);
      if (status === 422 && errArr.length > 0) {
        setCreateFieldErrors(fieldErrorsFromArray(errArr));
        notify.warning('Revise los campos');
      } else {
        notify.error(getErrorMessage(e, 'Error al crear proveedor'));
      }
    } finally {
      setCreating(false);
    }
  };

  return {
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
    fetchProveedores,
    searchProveedores,
    createFieldErrors,
    editFieldErrors
  };
}
