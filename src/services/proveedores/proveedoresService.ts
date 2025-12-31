import { http } from '#/services/apiClient/http';

// Types
export interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  direccion?: string | null;
  telefono?: string | null;
  representante?: string | null;
  telefono_representante?: string | null;
  activo: 0 | 1;
}

export interface CreateProveedorPayload {
  nombre_proveedor: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
  telefono_representante?: string;
  activo?: 0 | 1;
}

export interface UpdateProveedorPayload {
  nombre_proveedor?: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
  telefono_representante?: string;
  activo?: 0 | 1;
}

export interface ProveedorOption {
  value: number;
  label: string;
}

export interface IProveedoresService {
  getAll(): Promise<Proveedor[]>;
  getOptions(activos?: 0 | 1): Promise<ProveedorOption[]>;
  getActivos(): Promise<Proveedor[]>;
  search(nombre: string, opts?: { activos?: 0 | 1 }): Promise<Proveedor[]>;
  getById(id: number): Promise<Proveedor>;
  create(payload: CreateProveedorPayload): Promise<{ id_proveedor: number }>;
  update(id: number, payload: UpdateProveedorPayload): Promise<{ id_proveedor: number }>;
  softDelete(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
  deleteMultipleSoft(ids: number[]): Promise<{ deleted: number; requested: number }>;
  deleteMultipleHard(ids: number[]): Promise<{ deleted: number; requested: number }>;
}

const getAll = (): Promise<Proveedor[]> => {
  return http<Proveedor[]>('/proveedores', { method: 'GET' });
};

const getOptions = (activos?: 0 | 1): Promise<ProveedorOption[]> => {
  const query = typeof activos !== 'undefined' ? `?activos=${activos}` : '';
  return http<ProveedorOption[]>(`/proveedores/options${query}`, { method: 'GET' });
};

const getActivos = (): Promise<Proveedor[]> => {
  return http<Proveedor[]>('/proveedores/activos', { method: 'GET' });
};

const search = (nombre: string, opts?: { activos?: 0 | 1 }): Promise<Proveedor[]> => {
  const params = new URLSearchParams();
  params.set('nombre', nombre.trim());
  if (opts && typeof opts.activos !== 'undefined') params.set('activos', String(opts.activos));
  return http<Proveedor[]>(`/proveedores/search?${params.toString()}`, { method: 'GET' });
};

const getById = (id: number): Promise<Proveedor> => {
  return http<Proveedor>(`/proveedores/${id}`, { method: 'GET' });
};

const create = (payload: CreateProveedorPayload = { nombre_proveedor: '' }): Promise<{ id_proveedor: number }> => {
  const body = { activo: 1, ...payload };
  return http<{ id_proveedor: number }>('/proveedores', { method: 'POST', body });
};

const update = (id: number, payload: UpdateProveedorPayload): Promise<{ id_proveedor: number }> => {
  return http<{ id_proveedor: number }>(`/proveedores/${id}`, { method: 'PUT', body: payload });
};

const softDelete = (id: number): Promise<void> => {
  return http<void>(`/proveedores/${id}`, { method: 'DELETE' });
};

const hardDelete = (id: number): Promise<void> => {
  return http<void>(`/proveedores/${id}/permanent`, { method: 'DELETE' });
};

const deleteMultipleSoft = async (ids: number[]): Promise<{ deleted: number; requested: number }> => {
  const results = await Promise.allSettled(ids.map((id) => softDelete(id)));
  const deleted = results.filter((r) => r.status === 'fulfilled').length;
  return { deleted, requested: ids.length };
};

const deleteMultipleHard = async (ids: number[]): Promise<{ deleted: number; requested: number }> => {
  const results = await Promise.allSettled(ids.map((id) => hardDelete(id)));
  const deleted = results.filter((r) => r.status === 'fulfilled').length;
  return { deleted, requested: ids.length };
};

export const ProveedoresService: IProveedoresService = {
  getAll,
  getOptions,
  getActivos,
  search,
  getById,
  create,
  update,
  softDelete,
  hardDelete,
  deleteMultipleSoft,
  deleteMultipleHard
};
