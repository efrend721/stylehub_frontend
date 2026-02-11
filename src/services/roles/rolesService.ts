import { http } from '#/services/apiClient/http';
import type { Rol, RolSelect } from '#/views/admin/roles';

export interface IRolesService {
  getAll(token?: string): Promise<Rol[]>;
  getForSelect(scope?: 'all' | 'operativos', token?: string): Promise<RolSelect[]>;
  getById(id: number, token?: string): Promise<Rol>;
  create(payload: import('#/views/admin/roles').CreateRolPayload, token?: string): Promise<Rol>;
  update(rol: Rol, token?: string): Promise<unknown>;
  updateMenus(id: number, menuItems: number[], token?: string): Promise<unknown>;
  deleteOne(id: number, token?: string): Promise<unknown>;
  deleteMultiple(ids: (string|number)[], token?: string): Promise<unknown[]>;
}

const getAll = (token?: string) => {
  return http<Rol[]>('/roles', { token });
};

const getForSelect = (scope: 'all' | 'operativos' = 'all', token?: string) => {
  const path = scope === 'operativos' ? '/roles/select-operativos' : '/roles/select';
  return http<RolSelect[]>(path, { token }).catch(() => http<RolSelect[]>('/roles', { token }));
};

const getById = (id: number, token?: string): Promise<Rol> => {
  return http<Rol>(`/roles/${id}`, { token });
};

const create = (payload: import('#/views/admin/roles').CreateRolPayload, token?: string): Promise<Rol> => {
  return http<Rol>('/roles', { method: 'POST', body: payload, token });
};

const update = (rol: Rol, token?: string) => {
  const payload = {
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    estado: rol.estado
  };
  return http<unknown>(`/roles/${encodeURIComponent(String(rol.id_rol))}`, { method: 'PUT', body: payload, token });
};

const updateMenus = (id: number, menuItems: number[], token?: string) => {
  const payload = { menu_items: menuItems };
  return http<unknown>(`/roles/${encodeURIComponent(String(id))}/menus`, { method: 'PUT', body: payload, token });
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
  updateMenus,
  deleteOne,
  deleteMultiple
};
