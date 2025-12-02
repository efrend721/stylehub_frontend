import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { RolesService } from '#/services';
import notify from '#/utils/notify';
import { getErrorMessage } from '#/utils/errorUtils';
import type { Rol } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

// API gestionada desde RolesService

// Helpers centralizados en services

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

export function useRoles() {
  const { token } = useAuth();

  // headers manejados por el servicio

  const [rows, setRows] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const selectedIds = useMemo<GridRowId[]>(() => {
    const ids = selectionModel.ids as unknown;
    if (ids instanceof Set) return Array.from(ids) as GridRowId[];
    if (Array.isArray(ids)) return ids as GridRowId[];
    return [] as GridRowId[];
  }, [selectionModel]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<(string | number)[]>([]);

  const [editRol, setEditRol] = useState<Rol | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await RolesService.getAll(token || undefined);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudo cargar roles'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids);
    setConfirmOpen(true);
  };

  const doDeleteSelected = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      const results = await Promise.all(
        deleteIds.map(async (id) => {
          try {
            await RolesService.deleteOne(Number(id), token || undefined);
            return { ok: true, id };
          } catch {
            return { ok: false, id };
          }
        })
      );
      const okCount = results.filter((r) => r.ok).length;
      const failCount = results.length - okCount;
      if (okCount > 0) notify.success(`${okCount} rol(es) eliminados`);
      if (failCount > 0) notify.error(`No se eliminaron ${failCount}`);
      await fetchRoles();
      setSelectionModel(EMPTY_SELECTION);
      setDeleteIds([]);
    } catch (e) {
      notify.error(getErrorMessage(e, 'Error al eliminar selección'));
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openEditFor = (rol: Rol) => {
    setEditRol({ ...rol });
  };

  const saveEdit = async () => {
    if (!editRol) return;
    setSaving(true);
    try {
      // Compatibilidad con nueva firma: (rol, menuItems?, token?)
      await RolesService.update(editRol, undefined, token || undefined);
      notify.success('Rol actualizado');
      setEditRol(null);
      await fetchRoles();
    } catch (e) {
      notify.error(getErrorMessage(e, 'No se pudo actualizar el rol'));
    } finally {
      setSaving(false);
    }
  };

  return {
    // data
    rows,
    loading,
    error,

    // selection
    selectionModel,
    setSelectionModel,
    selectedIds,

    // delete
    confirmOpen,
    setConfirmOpen,
    deleteIds,
    openConfirmFor,
    doDeleteSelected,
    deleting,

    // edit
    editRol,
    setEditRol,
    openEditFor,
    saveEdit,
    saving,

    // misc
    fetchRoles
  };
}
