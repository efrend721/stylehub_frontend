import { useCallback, useEffect, useState } from 'react';
import { CategoriasProductoService } from '#/services';
import { notify } from '#/utils/notify';
import { getErrorMessage, getErrorStatus, getErrorArray } from '#/utils/errorUtils';
import type { CategoriaProducto, CreateCategoriaProductoPayload, UpdateCategoriaProductoPayload } from './types';

// Construye mapa campo -> mensaje desde arreglo de errores del backend
function fieldErrorsFromArray(arr: Array<{ path?: string[]; message?: string }>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of arr) {
    const field = Array.isArray(e.path) ? e.path[0] : undefined;
    const msg = typeof e.message === 'string' ? e.message : undefined;
    if (field && msg) out[field] = msg;
  }
  return out;
}

export function useCategoriaProducto() {
  const [rows, setRows] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const [editItem, setEditItem] = useState<CategoriaProducto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoriasProductoService.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo cargar categorías de producto');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategorias();
  }, [fetchCategorias]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map(String));
    setConfirmOpen(true);
  };

  const doBulkDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      const { deleted, requested } = await CategoriasProductoService.deleteMultiple(deleteIds);
      if (deleted === requested) {
        notify.success(`${deleted} categoría(s) eliminada(s)`);
      } else {
        notify.error(`Eliminadas ${deleted}/${requested}. Revise dependencias.`);
      }
      await fetchCategorias();
      setDeleteIds([]);
    } catch (e) {
      const msg = getErrorMessage(e, 'Error al eliminar categorías');
      notify.error(msg);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openEditFor = (item: CategoriaProducto) => {
    setEditItem({ ...item });
    setEditFieldErrors({});
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    setEditFieldErrors({});
    try {
      const payload: UpdateCategoriaProductoPayload = { nombre_categoria: editItem.nombre_categoria.trim() };
      await CategoriasProductoService.update(editItem.id_categoria, payload);
      notify.success('Categoría de producto actualizada');
      setEditItem(null);
      await fetchCategorias();
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

  const createCategoria = async (payload: CreateCategoriaProductoPayload) => {
    setCreating(true);
    setCreateFieldErrors({});
    try {
      await CategoriasProductoService.create({
        id_categoria: payload.id_categoria.toUpperCase().trim(),
        nombre_categoria: payload.nombre_categoria.trim()
      });
      notify.success('Categoría de producto creada');
      closeCreateDialog();
      await fetchCategorias();
    } catch (e) {
      const status = getErrorStatus(e);
      const errArr = getErrorArray(e);
      if (status === 422 && errArr.length > 0) {
        setCreateFieldErrors(fieldErrorsFromArray(errArr));
        notify.warning('Revise los campos');
      } else {
        notify.error(getErrorMessage(e, 'Error al crear categoría'));
      }
    } finally {
      setCreating(false);
    }
  };

  return {
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
    createCategoria,
    creating,
    fetchCategorias,
    createFieldErrors,
    editFieldErrors
  };
}
