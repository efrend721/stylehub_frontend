import { http } from '#/services/apiClient/http';

// Types
export interface CategoriaArticulo {
  id_categoria: string;
  nombre_categoria: string;
}

export interface CreateCategoriaArticuloPayload {
  id_categoria: string;
  nombre_categoria: string;
}

export interface UpdateCategoriaArticuloPayload {
  nombre_categoria: string;
}

export interface ICategoriasArticuloService {
  getAll(): Promise<CategoriaArticulo[]>;
  getById(id: string): Promise<CategoriaArticulo>;
  search(nombre: string): Promise<CategoriaArticulo[]>;
  getOptions(): Promise<Array<{ value: string; label: string }>>;
  create(payload: CreateCategoriaArticuloPayload): Promise<{ id_categoria: string }>;
  update(id: string, payload: UpdateCategoriaArticuloPayload): Promise<{ id_categoria: string }>;
  deleteOne(id: string): Promise<void>;
  deleteMultiple(ids: string[]): Promise<{ deleted: number; requested: number }>;
}

const getAll = (): Promise<CategoriaArticulo[]> => {
  return http<CategoriaArticulo[]>('/categorias-articulo', { method: 'GET' });
};

const getById = (id: string): Promise<CategoriaArticulo> => {
  return http<CategoriaArticulo>(`/categorias-articulo/${id}`, { method: 'GET' });
};

const search = (nombre: string): Promise<CategoriaArticulo[]> => {
  return http<CategoriaArticulo[]>(`/categorias-articulo/search?nombre=${encodeURIComponent(nombre)}`, { method: 'GET' });
};

const getOptions = (): Promise<Array<{ value: string; label: string }>> => {
  return http<Array<{ value: string; label: string }>>('/categorias-articulo/options', { method: 'GET' });
};

const create = (payload: CreateCategoriaArticuloPayload): Promise<{ id_categoria: string }> => {
  return http<{ id_categoria: string }>('/categorias-articulo', { method: 'POST', body: payload });
};

const update = (id: string, payload: UpdateCategoriaArticuloPayload): Promise<{ id_categoria: string }> => {
  return http<{ id_categoria: string }>(`/categorias-articulo/${id}`, { method: 'PUT', body: payload });
};

const deleteOne = (id: string): Promise<void> => {
  return http<void>(`/categorias-articulo/${id}`, { method: 'DELETE' });
};

const deleteMultiple = async (ids: string[]): Promise<{ deleted: number; requested: number }> => {
  const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));
  const deleted = results.filter((r) => r.status === 'fulfilled').length;
  return { deleted, requested: ids.length };
};

export const CategoriasArticuloService: ICategoriasArticuloService = {
  getAll,
  getById,
  search,
  getOptions,
  create,
  update,
  deleteOne,
  deleteMultiple
};
