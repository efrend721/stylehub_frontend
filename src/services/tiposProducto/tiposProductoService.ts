import { http } from '#/services/apiClient/http';

// Types
export interface TipoProducto {
  id_tipo: number;
  nombre_tipo: string;
}

export interface CreateTipoProductoPayload {
  nombre_tipo: string;
}

export interface UpdateTipoProductoPayload {
  nombre_tipo: string;
}

export interface ITiposProductoService {
  getAll(): Promise<TipoProducto[]>;
  getById(id: number): Promise<TipoProducto>;
  search(nombre: string): Promise<TipoProducto[]>;
  getOptions(): Promise<Array<{ value: number; label: string }>>;
  create(payload: CreateTipoProductoPayload): Promise<{ id_tipo: number }>;
  update(id: number, payload: UpdateTipoProductoPayload): Promise<{ id_tipo: number }>;
  deleteOne(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<{ deleted: number; requested: number }>;
}

const getAll = (): Promise<TipoProducto[]> => {
  return http<TipoProducto[]>('/tipos-producto', { method: 'GET' });
};

const getById = (id: number): Promise<TipoProducto> => {
  return http<TipoProducto>(`/tipos-producto/${id}`, { method: 'GET' });
};

const search = (nombre: string): Promise<TipoProducto[]> => {
  return http<TipoProducto[]>(`/tipos-producto/search?nombre=${encodeURIComponent(nombre)}`, { method: 'GET' });
};

const getOptions = (): Promise<Array<{ value: number; label: string }>> => {
  return http<Array<{ value: number; label: string }>>('/tipos-producto/options', { method: 'GET' });
};

const create = (payload: CreateTipoProductoPayload): Promise<{ id_tipo: number }> => {
  return http<{ id_tipo: number }>('/tipos-producto', { method: 'POST', body: payload });
};

const update = (id: number, payload: UpdateTipoProductoPayload): Promise<{ id_tipo: number }> => {
  return http<{ id_tipo: number }>(`/tipos-producto/${id}`, { method: 'PUT', body: payload });
};

const deleteOne = (id: number): Promise<void> => {
  return http<void>(`/tipos-producto/${id}`, { method: 'DELETE' });
};

const deleteMultiple = async (ids: number[]): Promise<{ deleted: number; requested: number }> => {
  const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));
  const deleted = results.filter((r) => r.status === 'fulfilled').length;
  return { deleted, requested: ids.length };
};

export const TiposProductoService: ITiposProductoService = {
  getAll,
  getById,
  search,
  getOptions,
  create,
  update,
  deleteOne,
  deleteMultiple
};
