import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { useUserManagement } from './hooks/useUserManagement';
import { UsuariosService } from '#/services';
import { notify } from '#/utils/notify';
import { getErrorMessage, getErrorStatus, getErrorArray } from '#/utils/errorUtils';
import type { Usuario, NuevoUsuario, UsuarioEdit } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import type { UsuariosSearchParams } from '#/services/usuarios/usuariosService';

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

// ApiResponse moved to services/common/types; no need to duplicate here

// Función para validar datos de usuario antes de enviar
function validateUserData(usuario: NuevoUsuario): string[] {
  const errors: string[] = [];

  if (!usuario.usuario_acceso?.trim()) errors.push('Usuario de acceso requerido');
  if (!usuario.contrasena?.trim()) errors.push('Contraseña requerida');
  if (!usuario.nombre_usuario?.trim()) errors.push('Nombre requerido');
  if (!usuario.apellido_usuario?.trim()) errors.push('Apellido requerido');
  if (!usuario.correo_electronico?.trim()) errors.push('Email requerido');
  if (!usuario.telefono?.trim()) errors.push('Teléfono requerido');
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

export function useUsuarios() {
  const { token, user } = useAuth();
  const scope: 'global' | 'mine' = user?.id_rol === 2 ? 'mine' : 'global';
  const { attachEstablecimiento } = useUserManagement();

  // headers handled by services layer

  const [rows, setRows] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const [editUser, setEditUser] = useState<UsuarioEdit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  // Estados para crear usuario
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  const lastQueryRef = useRef<{ kind: 'all' } | { kind: 'search'; params: UsuariosSearchParams }>({ kind: 'all' });

  const searchUsuarios = useCallback(async (params: UsuariosSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      if (scope !== 'global') {
        // Para rol 2 no hay endpoint documentado de búsqueda; mantener listado normal.
        const data = await UsuariosService.getAll(scope, token || undefined);
        const list = Array.isArray(data) ? data : [];
        setRows(list);
        setEmptyHint(list.length === 0 ? (emptyHint ?? 'No hay usuarios.') : null);
        lastQueryRef.current = { kind: 'all' };
        return;
      }

      const data = await UsuariosService.search(params, token || undefined);
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setEmptyHint(list.length === 0 ? 'Sin resultados.' : null);
      lastQueryRef.current = { kind: 'search', params };
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo buscar usuarios');
      setError(msg);
      setEmptyHint(null);
    } finally {
      setLoading(false);
    }
  }, [scope, token, emptyHint]);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UsuariosService.getAll(scope, token || undefined);
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setEmptyHint(null);
      lastQueryRef.current = { kind: 'all' };
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'No se pudo cargar usuarios');
      if (status === 404) {
        // Superficial 404: mostrar notificación pero mantener UI estable
        notify.info(msg || 'No se encontraron usuarios para tu establecimiento');
        setRows([]);
        setError(null);
        setEmptyHint('No se encontraron usuarios para tu establecimiento');
      } else {
        setError(msg);
        setEmptyHint(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, scope]);

  const refreshList = useCallback(async () => {
    const last = lastQueryRef.current;
    if (last.kind === 'search') {
      await searchUsuarios(last.params);
      return;
    }
    await fetchUsuarios();
  }, [fetchUsuarios, searchUsuarios]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  // Limpiar selección si cambia el alcance (scope)
  useEffect(() => {
    setSelectionModel({ type: 'include', ids: new Set<GridRowId>() });
  }, [scope]);

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map(String));
    setConfirmOpen(true);
  };

  const doBulkDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      // Intento 1: endpoint de eliminación masiva vía servicio
      try {
        const { deleted = deleteIds.length, requested = deleteIds.length } = await UsuariosService.deleteMultiple(
          deleteIds,
          scope,
          token || undefined
        ).catch(() => ({ deleted: 0, requested: deleteIds.length }));
        if (deleted === requested) {
          notify.success(`${deleted} usuario(s) eliminados`);
        } else {
          notify.error(`Eliminados ${deleted}/${requested}. Revise permisos o estados.`);
        }
      } catch {
        // Fallback: eliminar uno por uno si el endpoint masivo falla (CORS/404/etc.)
        notify.info('No se pudo usar bulk-delete. Intentando eliminación individual…');
        const results = await Promise.all(
          deleteIds.map(async (id) => {
            try {
              await UsuariosService.deleteOne(String(id), scope, token || undefined);
              const ok = true;
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
      await refreshList();
      setSelectionModel(EMPTY_SELECTION);
      setDeleteIds([]);
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'Error al eliminar selección');
      if (status === 404) {
        notify.info(msg || 'No puedes eliminar usuarios de otros establecimientos');
      } else {
        notify.error(msg);
      }
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
    setEditFieldErrors({});
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      // Forzar id_establecimiento del admin autenticado
      const payload = attachEstablecimiento(editUser);
      setEditFieldErrors({});
      await UsuariosService.update(payload, scope, token || undefined);
      notify.success('Usuario actualizado');
      setEditUser(null);
      await refreshList();
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'No se pudo actualizar el usuario');
      if (status === 404) {
        notify.info(msg || 'El usuario no pertenece a tu establecimiento');
      } else if (status === 422) {
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

  // Función para crear nuevo usuario
  const createUser = async (nuevoUsuario: NuevoUsuario) => {
    setCreating(true);
    try {
      // Adjuntar id_establecimiento automáticamente antes de validar
      const payload = attachEstablecimiento(nuevoUsuario);
      // Validar datos antes de enviar
      const validationErrors = validateUserData(payload);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // limpiar errores previos
      setCreateFieldErrors({});
      await UsuariosService.create(payload, scope, token || undefined);
      notify.success('Usuario creado exitosamente');
      setCreateDialogOpen(false);
      await refreshList();
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'No se pudo crear el usuario');
      if (status === 404) {
        notify.info(msg || 'Acción no permitida para tu establecimiento');
      } else if (status === 422) {
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

  return {
    // data
    rows,
    loading,
    error,
    emptyHint,

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
    editFieldErrors,

    // create
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createUser,
    creating,
    createFieldErrors,

    // misc
    fetchUsuarios,
    refreshList,
    searchUsuarios
  };
}
