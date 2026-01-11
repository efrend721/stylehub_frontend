import { http } from '../apiClient/http';
import type { Usuario, NuevoUsuario, UsuarioEdit } from '../../views/admin/usuarios/types';

type Scope = 'global' | 'mine';

export type UsuariosSearchSort = 'nombre' | 'apellido' | 'usuario' | 'correo';
export type UsuariosSearchOrder = 'asc' | 'desc';

export type UsuariosSearchEstado = '0' | '1' | 'all' | '*';

export type UsuariosSearchParams = {
  est?: string;
  q?: string;
  rol?: number;
  estado?: UsuariosSearchEstado;
  sort?: UsuariosSearchSort;
  order?: UsuariosSearchOrder;
};

function basePath(scope: Scope = 'global'): string {
  return scope === 'mine' ? '/usuarios/mi-establecimiento' : '/usuarios';
}

function searchPath(scope: Scope = 'global'): string {
  return scope === 'mine' ? '/usuarios/mi-establecimiento/search' : '/usuarios/search';
}

export const UsuariosService = {
  getAll(scope: Scope = 'global', token?: string, params: { estado?: UsuariosSearchEstado } = {}) {
    const sp = new URLSearchParams();
    if (params.estado) sp.set('estado', params.estado);
    const qs = sp.toString();
    const url = qs ? `${basePath(scope)}?${qs}` : basePath(scope);
    return http<Usuario[]>(url, { token });
  },
  search(params: UsuariosSearchParams = {}, token?: string, scope: Scope = 'global') {
    const sp = new URLSearchParams();
    if (scope !== 'mine' && params.est && params.est.trim() !== '') sp.set('est', params.est.trim());
    if (params.q && params.q.trim() !== '') sp.set('q', params.q.trim());
    if (params.rol != null) sp.set('rol', String(params.rol));
    if (params.estado) sp.set('estado', params.estado);
    if (params.sort) sp.set('sort', params.sort);
    if (params.order) sp.set('order', params.order);
    const qs = sp.toString();
    const base = searchPath(scope);
    const url = qs ? `${base}?${qs}` : base;
    return http<Usuario[]>(url, { token });
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
  update(editUser: UsuarioEdit, scope: Scope = 'global', token?: string, opts: { omitRole?: boolean } = {}) {
    const payload: Record<string, unknown> = {
      nombre_usuario: editUser.nombre_usuario.trim(),
      apellido_usuario: editUser.apellido_usuario.trim(),
      correo_electronico: editUser.correo_electronico.trim(),
      telefono: editUser.telefono?.trim() || null,
      id_establecimiento: editUser.id_establecimiento.trim(),
      estado: Number(editUser.estado)
    };
    if (!opts.omitRole) {
      payload.id_rol = Number(editUser.id_rol);
    }
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
