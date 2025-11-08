import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { notify } from '#/utils/notify';
import type { Usuario, NuevoUsuario, UsuarioEdit } from './types';
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

// Función para validar datos de usuario antes de enviar
function validateUserData(usuario: NuevoUsuario): string[] {
  const errors: string[] = [];
  
  if (!usuario.usuario_acceso?.trim()) errors.push('Usuario de acceso requerido');
  if (!usuario.contrasena?.trim()) errors.push('Contraseña requerida');
  if (!usuario.nombre_usuario?.trim()) errors.push('Nombre requerido');
  if (!usuario.apellido_usuario?.trim()) errors.push('Apellido requerido');
  if (!usuario.correo_electronico?.trim()) errors.push('Email requerido');
  // Teléfono es opcional
  if (!usuario.id_establecimiento?.trim()) errors.push('Establecimiento requerido');
  
  if (typeof usuario.id_rol !== 'number' || usuario.id_rol <= 0) {
    errors.push('Rol inválido');
  }
  
  if (typeof usuario.estado !== 'number' || (usuario.estado !== 0 && usuario.estado !== 1)) {
    errors.push('Estado inválido (debe ser 0 o 1)');
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (usuario.correo_electronico && !emailRegex.test(usuario.correo_electronico.trim())) {
    errors.push('Formato de email inválido');
  }
  
  return errors;
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

  const [editUser, setEditUser] = useState<UsuarioEdit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para crear usuario
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

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
    // Convertir Usuario a UsuarioEdit
    const editableUser: UsuarioEdit = {
      usuario_acceso: user.usuario_acceso,
      nombre_usuario: user.nombre_usuario,
      apellido_usuario: user.apellido_usuario,
      telefono: user.telefono,
      correo_electronico: user.correo_electronico,
      id_rol: user.id_rol,
      id_establecimiento: user.id_establecimiento,
      estado: user.estado
      // contrasena se deja undefined inicialmente
    };
    setEditUser(editableUser);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      // Crear payload con todos los campos editables según el endpoint
      const payload: Record<string, unknown> = {
        nombre_usuario: editUser.nombre_usuario.trim(),
        apellido_usuario: editUser.apellido_usuario.trim(),
        correo_electronico: editUser.correo_electronico.trim(),
        telefono: editUser.telefono?.trim() || null,
        id_rol: Number(editUser.id_rol),
        id_establecimiento: editUser.id_establecimiento.trim(),
        estado: Number(editUser.estado)
      };

      // Si el editUser tiene contraseña definida, incluirla
      if (editUser.contrasena && editUser.contrasena.trim()) {
        payload.contrasena = editUser.contrasena.trim();
      }

      console.log('Actualizando usuario:', editUser.usuario_acceso);
      console.log('Payload:', payload);

      const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(editUser.usuario_acceso)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      let raw: unknown;
      try {
        raw = await res.json();
        console.log('Response:', raw);
      } catch (jsonError) {
        console.log('Error parsing JSON response:', jsonError);
        const textResponse = await res.text();
        console.log('Raw response text:', textResponse);
        throw new Error(`Server error ${res.status}: ${textResponse}`);
      }
      
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

  // Función para crear nuevo usuario
  const createUser = async (nuevoUsuario: NuevoUsuario) => {
    setCreating(true);
    try {
      console.log('Datos originales del usuario:', JSON.stringify(nuevoUsuario, null, 2));
      
      // Validar datos antes de enviar
      const validationErrors = validateUserData(nuevoUsuario);
      if (validationErrors.length > 0) {
        console.error('Errores de validación:', validationErrors);
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }
      
      // Transformar datos para enviar al backend
      const payload = {
        usuario_acceso: nuevoUsuario.usuario_acceso.trim(),
        contrasena: nuevoUsuario.contrasena.trim(),
        nombre_usuario: nuevoUsuario.nombre_usuario.trim(),
        apellido_usuario: nuevoUsuario.apellido_usuario.trim(),
        correo_electronico: nuevoUsuario.correo_electronico.trim(),
        telefono: nuevoUsuario.telefono.trim() || null, // Permitir null si está vacío
        id_rol: Number(nuevoUsuario.id_rol),
        id_establecimiento: nuevoUsuario.id_establecimiento?.trim() || null, // Proteger contra undefined
        estado: Number(nuevoUsuario.estado)
      };
      
      console.log('Payload transformado:', JSON.stringify(payload, null, 2));
      console.log('Headers:', headers);
      console.log('URL:', `${API_BASE}/usuarios`);
      
      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      // Intentar leer el response incluso si hay error
      let raw: unknown;
      try {
        raw = await res.json();
        console.log('Response body:', raw);
      } catch (jsonError) {
        console.log('Error parsing JSON response:', jsonError);
        const textResponse = await res.text();
        console.log('Raw response text:', textResponse);
        throw new Error(`Server error ${res.status}: ${textResponse}`);
      }
      
      if (!res.ok || !isApiResponse<unknown>(raw) || !raw.success) {
        const msg = isApiResponse<unknown>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        console.error('API Error:', msg);
        console.error('Full response:', raw);
        throw new Error(msg);
      }
      notify.success((typeof raw.message === 'string' ? raw.message : undefined) || 'Usuario creado exitosamente');
      setCreateDialogOpen(false);
      await fetchUsuarios();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo crear el usuario';
      notify.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
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

    // create
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createUser,
    creating,

    // misc
    fetchUsuarios
  };
}
