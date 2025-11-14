import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { UsuariosService } from '#/services';
import { notify } from '#/utils/notify';
import type { Usuario, NuevoUsuario, UsuarioEdit } from './types';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';

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

export function useUsuarios() {
  const { token } = useAuth();

  // headers handled by services layer

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
      const data = await UsuariosService.getAll(token || undefined);
      const list = Array.isArray(data) ? data : [];
      setRows(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      // Intento 1: endpoint de eliminación masiva vía servicio
      try {
        const { deleted = deleteIds.length, requested = deleteIds.length } = await UsuariosService.deleteMultiple(deleteIds, token || undefined).catch(() => ({ deleted: 0, requested: deleteIds.length }));
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
              await UsuariosService.deleteOne(String(id), token || undefined);
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
      await UsuariosService.update(editUser, token || undefined);
      notify.success('Usuario actualizado');
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
      // Validar datos antes de enviar
      const validationErrors = validateUserData(nuevoUsuario);
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }
      
      await UsuariosService.create(nuevoUsuario, token || undefined);
      notify.success('Usuario creado exitosamente');
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
