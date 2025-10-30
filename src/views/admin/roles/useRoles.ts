import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';
import type { Rol } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === 'boolean';
}

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

export function useRoles() {
  const { token } = useAuth();

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

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
      const res = await fetch(`${API_BASE}/roles`, { headers });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<Rol[]>(raw) || !raw.success) {
        const msg = isApiResponse<Rol[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const list = Array.isArray(raw.data) ? raw.data : [];
      setRows(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar roles';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [headers]);

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
            const res = await fetch(`${API_BASE}/roles/${encodeURIComponent(String(id))}`, { method: 'DELETE', headers });
            const raw: unknown = await res.json().catch(() => ({}));
            const ok = res.ok && isApiResponse<unknown>(raw) && !!raw.success;
            return { ok, id };
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
      const msg = e instanceof Error ? e.message : 'Error al eliminar selección';
      notify.error(msg);
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
      const payload = {
        nombre: editRol.nombre,
        descripcion: editRol.descripcion,
        estado: editRol.estado
      } as Partial<Rol>;
      const res = await fetch(`${API_BASE}/roles/${encodeURIComponent(String(editRol.id_rol))}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<unknown>(raw) || !raw.success) {
        const msg = isApiResponse<unknown>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      notify.success((typeof raw.message === 'string' ? raw.message : undefined) || 'Rol actualizado');
      setEditRol(null);
      await fetchRoles();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar el rol';
      notify.error(msg);
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
