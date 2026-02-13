import { useCallback, useEffect, useState } from 'react';
import { TiposArticuloService } from '#/services';
import { notify } from '#/utils/notify';
import { getErrorMessage, getErrorStatus, getErrorArray } from '#/utils/errorUtils';
import type { TipoArticulo, CreateTipoArticuloPayload, UpdateTipoArticuloPayload } from './types';

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

export function useTiposArticulo() {
  const [rows, setRows] = useState<TipoArticulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const [editItem, setEditItem] = useState<TipoArticulo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TiposArticuloService.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo cargar tipos de artículo');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTipos();
  }, [fetchTipos]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map(Number));
    setConfirmOpen(true);
  };

  const doBulkDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      const { deleted, requested } = await TiposArticuloService.deleteMultiple(deleteIds);
      if (deleted === requested) {
        notify.success(`${deleted} tipo(s) eliminados`);
      } else {
        notify.error(`Eliminados ${deleted}/${requested}. Revise dependencias.`);
      }
      await fetchTipos();
      setDeleteIds([]);
    } catch (e) {
      const msg = getErrorMessage(e, 'Error al eliminar tipos');
      notify.error(msg);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openEditFor = (item: TipoArticulo) => {
    setEditItem({ ...item });
    setEditFieldErrors({});
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    setEditFieldErrors({});
    try {
      const payload: UpdateTipoArticuloPayload = { nombre_tipo: editItem.nombre_tipo.trim() };
      await TiposArticuloService.update(editItem.id_tipo, payload);
      notify.success('Tipo de artículo actualizado');
      setEditItem(null);
      await fetchTipos();
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

  const createTipo = async (payload: CreateTipoArticuloPayload) => {
    setCreating(true);
    setCreateFieldErrors({});
    try {
      await TiposArticuloService.create({ nombre_tipo: payload.nombre_tipo.trim() });
      notify.success('Tipo de artículo creado');
      closeCreateDialog();
      await fetchTipos();
    } catch (e) {
      const status = getErrorStatus(e);
      const errArr = getErrorArray(e);
      if (status === 422 && errArr.length > 0) {
        setCreateFieldErrors(fieldErrorsFromArray(errArr));
        notify.warning('Revise los campos');
      } else {
        notify.error(getErrorMessage(e, 'Error al crear tipo'));
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
    createTipo,
    creating,
    fetchTipos,
    createFieldErrors,
    editFieldErrors
  };
}
