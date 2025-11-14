import { http } from '../apiClient/http';
import type { Usuario, NuevoUsuario, UsuarioEdit } from '../../views/admin/usuarios/types';

export const UsuariosService = {
  getAll(token?: string) {
    return http<Usuario[]>('/usuarios', { token });
  },
  create(usuario: NuevoUsuario, token?: string) {
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
    return http<unknown>('/usuarios', { method: 'POST', body: payload, token });
  },
  update(editUser: UsuarioEdit, token?: string) {
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
    return http<unknown>(`/usuarios/${encodeURIComponent(editUser.usuario_acceso)}`, {
      method: 'PUT',
      body: payload,
      token
    });
  },
  deleteOne(usuarioAcceso: string, token?: string) {
    return http<unknown>(`/usuarios/${encodeURIComponent(usuarioAcceso)}`, { method: 'DELETE', token });
  },
  deleteMultiple(usernames: string[], token?: string) {
    return http<{ deleted?: number; requested?: number }>(`/usuarios/bulk-delete`, {
      method: 'DELETE',
      body: { usernames },
      token
    });
  }
};
