import { http } from '#/services/apiClient/http';
import type { Rol, RolSelect } from '#/views/admin/roles/types';

export interface IRolesService {
  getAll(token?: string): Promise<Rol[]>;
  getForSelect(token?: string): Promise<RolSelect[]>;
  getById(id: number, token?: string): Promise<Rol>;
  create(payload: import('#/views/admin/roles/types').CreateRolPayload, token?: string): Promise<Rol>;
  update(rol: Rol, menuItems?: number[], token?: string): Promise<unknown>;
  deleteOne(id: number, token?: string): Promise<unknown>;
  deleteMultiple(ids: (string|number)[], token?: string): Promise<unknown[]>;
}

const getAll = (token?: string) => {
  return http<Rol[]>('/roles', { token });
};

const getForSelect = (token?: string) => {
  return http<RolSelect[]>('/roles/select', { token }).catch(() => http<RolSelect[]>('/roles', { token }));
};

const getById = (id: number, token?: string): Promise<Rol> => {
  return http<Rol>(`/roles/${id}`, { token });
};

const create = (payload: import('#/views/admin/roles/types').CreateRolPayload, token?: string): Promise<Rol> => {
  return http<Rol>('/roles', { method: 'POST', body: payload, token });
};

const update = (rol: Rol, menuItems?: number[], token?: string) => {
  const payload = {
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    estado: rol.estado,
    menu_items: menuItems
  };
  return http<unknown>(`/roles/${encodeURIComponent(String(rol.id_rol))}`, { method: 'PUT', body: payload, token });
};

const deleteOne = (id: number, token?: string) => {
  return http<unknown>(`/roles/${encodeURIComponent(String(id))}`, { method: 'DELETE', token });
};

const deleteMultiple = (ids: (string|number)[], token?: string) => {
  return Promise.all(ids.map(i => deleteOne(Number(i), token)));
};

export const RolesService: IRolesService = {
  getAll,
  getForSelect,
  getById,
  create,
  update,
  deleteOne,
  deleteMultiple
};
