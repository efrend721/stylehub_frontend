import { http } from '#/services/apiClient/http';

// Types
export interface TipoArticulo {
  id_tipo: number;
  nombre_tipo: string;
}

export interface CreateTipoArticuloPayload {
  nombre_tipo: string;
}

export interface UpdateTipoArticuloPayload {
  nombre_tipo: string;
}

export interface ITiposArticuloService {
  getAll(): Promise<TipoArticulo[]>;
  getById(id: number): Promise<TipoArticulo>;
  search(nombre: string): Promise<TipoArticulo[]>;
  getOptions(): Promise<Array<{ value: number; label: string }>>;
  create(payload: CreateTipoArticuloPayload): Promise<{ id_tipo: number }>;
  update(id: number, payload: UpdateTipoArticuloPayload): Promise<{ id_tipo: number }>;
  deleteOne(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<{ deleted: number; requested: number }>;
}

const getAll = (): Promise<TipoArticulo[]> => {
  return http<TipoArticulo[]>('/tipos-articulo', { method: 'GET' });
};

const getById = (id: number): Promise<TipoArticulo> => {
  return http<TipoArticulo>(`/tipos-articulo/${id}`, { method: 'GET' });
};

const search = (nombre: string): Promise<TipoArticulo[]> => {
  return http<TipoArticulo[]>(`/tipos-articulo/search?nombre=${encodeURIComponent(nombre)}`, { method: 'GET' });
};

const getOptions = (): Promise<Array<{ value: number; label: string }>> => {
  return http<Array<{ value: number; label: string }>>('/tipos-articulo/options', { method: 'GET' });
};

const create = (payload: CreateTipoArticuloPayload): Promise<{ id_tipo: number }> => {
  return http<{ id_tipo: number }>('/tipos-articulo', { method: 'POST', body: payload });
};

const update = (id: number, payload: UpdateTipoArticuloPayload): Promise<{ id_tipo: number }> => {
  return http<{ id_tipo: number }>(`/tipos-articulo/${id}`, { method: 'PUT', body: payload });
};

const deleteOne = (id: number): Promise<void> => {
  return http<void>(`/tipos-articulo/${id}`, { method: 'DELETE' });
};

const deleteMultiple = async (ids: number[]): Promise<{ deleted: number; requested: number }> => {
  const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));
  const deleted = results.filter((r) => r.status === 'fulfilled').length;
  return { deleted, requested: ids.length };
};

export const TiposArticuloService: ITiposArticuloService = {
  getAll,
  getById,
  search,
  getOptions,
  create,
  update,
  deleteOne,
  deleteMultiple
};
