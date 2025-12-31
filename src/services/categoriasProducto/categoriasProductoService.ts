import { http } from '#/services/apiClient/http';

// Types
export interface CategoriaProducto {
  id_categoria: string;
  nombre_categoria: string;
}

export interface CreateCategoriaProductoPayload {
  id_categoria: string;
  nombre_categoria: string;
}

export interface UpdateCategoriaProductoPayload {
  nombre_categoria: string;
}

export interface ICategoriasProductoService {
  getAll(): Promise<CategoriaProducto[]>;
  getById(id: string): Promise<CategoriaProducto>;
  search(nombre: string): Promise<CategoriaProducto[]>;
  getOptions(): Promise<Array<{ value: string; label: string }>>;
  create(payload: CreateCategoriaProductoPayload): Promise<{ id_categoria: string }>;
  update(id: string, payload: UpdateCategoriaProductoPayload): Promise<{ id_categoria: string }>;
  deleteOne(id: string): Promise<void>;
  deleteMultiple(ids: string[]): Promise<{ deleted: number; requested: number }>;
}

const getAll = (): Promise<CategoriaProducto[]> => {
  return http<CategoriaProducto[]>('/categorias-producto', { method: 'GET' });
};

const getById = (id: string): Promise<CategoriaProducto> => {
  return http<CategoriaProducto>(`/categorias-producto/${id}`, { method: 'GET' });
};

const search = (nombre: string): Promise<CategoriaProducto[]> => {
  return http<CategoriaProducto[]>(`/categorias-producto/search?nombre=${encodeURIComponent(nombre)}`, { method: 'GET' });
};

const getOptions = (): Promise<Array<{ value: string; label: string }>> => {
  return http<Array<{ value: string; label: string }>>('/categorias-producto/options', { method: 'GET' });
};

const create = (payload: CreateCategoriaProductoPayload): Promise<{ id_categoria: string }> => {
  return http<{ id_categoria: string }>('/categorias-producto', { method: 'POST', body: payload });
};

const update = (id: string, payload: UpdateCategoriaProductoPayload): Promise<{ id_categoria: string }> => {
  return http<{ id_categoria: string }>(`/categorias-producto/${id}`, { method: 'PUT', body: payload });
};

const deleteOne = (id: string): Promise<void> => {
  return http<void>(`/categorias-producto/${id}`, { method: 'DELETE' });
};

const deleteMultiple = async (ids: string[]): Promise<{ deleted: number; requested: number }> => {
  const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));
  const deleted = results.filter((r) => r.status === 'fulfilled').length;
  return { deleted, requested: ids.length };
};

export const CategoriasProductoService: ICategoriasProductoService = {
  getAll,
  getById,
  search,
  getOptions,
  create,
  update,
  deleteOne,
  deleteMultiple
};
