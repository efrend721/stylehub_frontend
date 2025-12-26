import { http } from '../apiClient/http';
import type { Usuario, NuevoUsuario, UsuarioEdit } from '../../views/admin/usuarios/types';

type Scope = 'global' | 'mine';

function basePath(scope: Scope = 'global'): string {
  return scope === 'mine' ? '/usuarios/mi-establecimiento' : '/usuarios';
}

export const UsuariosService = {
  getAll(scope: Scope = 'global', token?: string) {
    return http<Usuario[]>(basePath(scope), { token });
  },
  create(usuario: NuevoUsuario, scope: Scope = 'global', token?: string) {
    const payload: Record<string, unknown> = {
      usuario_acceso: usuario.usuario_acceso.trim(),
      contrasena: usuario.contrasena.trim(),
      nombre_usuario: usuario.nombre_usuario.trim(),
      apellido_usuario: usuario.apellido_usuario.trim(),
      telefono: usuario.telefono?.trim() || null,
      correo_electronico: usuario.correo_electronico.trim(),
      id_rol: Number(usuario.id_rol),
      id_establecimiento: usuario.id_establecimiento?.trim() || null,
      estado: Number(usuario.estado)
    };
    return http<unknown>(basePath(scope), { method: 'POST', body: payload, token });
  },
  update(editUser: UsuarioEdit, scope: Scope = 'global', token?: string) {
    const payload: Record<string, unknown> = {
      nombre_usuario: editUser.nombre_usuario.trim(),
      apellido_usuario: editUser.apellido_usuario.trim(),
      correo_electronico: editUser.correo_electronico.trim(),
      telefono: editUser.telefono?.trim() || null,
      id_rol: Number(editUser.id_rol),
      id_establecimiento: editUser.id_establecimiento.trim(),
      estado: Number(editUser.estado)
    };
    if (editUser.contrasena && editUser.contrasena.trim()) {
      payload.contrasena = editUser.contrasena.trim();
    }
    return http<unknown>(`${basePath(scope)}/${encodeURIComponent(editUser.usuario_acceso)}`, {
      method: 'PUT',
      body: payload,
      token
    });
  },
  deleteOne(usuarioAcceso: string, scope: Scope = 'global', token?: string) {
    return http<unknown>(`${basePath(scope)}/${encodeURIComponent(usuarioAcceso)}`, { method: 'DELETE', token });
  },
  deleteMultiple(usernames: string[], scope: Scope = 'global', token?: string) {
    return http<{ deleted?: number; requested?: number }>(`${basePath(scope)}/bulk-delete`, {
      method: 'DELETE',
      body: { usernames },
      token
    });
  }
};
