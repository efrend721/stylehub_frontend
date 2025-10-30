import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';
import type { Usuario } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';
const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

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

export function useUsuarios() {
  const { token } = useAuth();

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [rows, setRows] = useState<Usuario[]>([]);
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
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/usuarios`, { headers });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<Usuario[]>(raw) || !raw.success) {
        const msg = isApiResponse<Usuario[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const list = Array.isArray(raw.data) ? raw.data : [];
      setRows(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map(String));
    setConfirmOpen(true);
  };

  const doBulkDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      // Intento 1: endpoint de eliminación masiva
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${API_BASE}/usuarios/bulk-delete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ usuarios: deleteIds.map(String) }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const raw: unknown = await res.json().catch(() => ({}));
        if (!res.ok || !isApiResponse<{ deleted?: number; requested?: number }>(raw) || !raw.success) {
          const msg = isApiResponse<{ deleted?: number; requested?: number }>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
          throw new Error(msg);
        }
        const deleted = raw.data?.deleted ?? deleteIds.length;
        const requested = raw.data?.requested ?? deleteIds.length;
        if (deleted === requested) {
          notify.success((typeof raw.message === 'string' ? raw.message : undefined) || `${deleted} usuario(s) eliminados`);
        } else {
          notify.error(`Eliminados ${deleted}/${requested}. Revise permisos o estados.`);
        }
      } catch {
        // Fallback: eliminar uno por uno si el endpoint masivo falla (CORS/404/etc.)
        notify.info('No se pudo usar bulk-delete. Intentando eliminación individual…');
        const results = await Promise.all(
          deleteIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(String(id))}`, { method: 'DELETE', headers });
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
        if (okCount > 0) notify.success(`${okCount} usuario(s) eliminados`);
        if (failCount > 0) notify.error(`No se eliminaron ${failCount}`);
      }
      // refrescar y limpiar selección
      await fetchUsuarios();
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

  const openEditFor = (user: Usuario) => {
    setEditUser({ ...user });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const payload = {
        nombre_usuario: editUser.nombre_usuario,
        apellido_usuario: editUser.apellido_usuario,
        correo_electronico: editUser.correo_electronico,
        estado: editUser.estado
      } as Partial<Usuario>;
      const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(editUser.usuario_acceso)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<unknown>(raw) || !raw.success) {
        const msg = isApiResponse<unknown>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      notify.success((typeof raw.message === 'string' ? raw.message : undefined) || 'Usuario actualizado');
      setEditUser(null);
      await fetchUsuarios();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar el usuario';
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
    doBulkDelete,
    deleting,

    // edit
    editUser,
    setEditUser,
    openEditFor,
    saveEdit,
    saving,

    // misc
    fetchUsuarios
  };
}
