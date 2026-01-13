import { http } from '#/services/apiClient/http';

function omitNullish<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    out[key] = value;
  }
  return out as Partial<T>;
}

// Types
export interface Producto {
  id_producto: number;
  id_establecimiento: string;
  id_tipo: number | null;
  nombre_tipo?: string | null;
  id_categoria: string | null;
  nombre_categoria?: string | null;
  id_proveedor: number | null;
  nombre_proveedor?: string | null;
  nombre_producto: string;
  descripcion?: string | null;
  fraccion: number;
  costo: number;
  costo_fraccion?: number | null;
  precio: number;
  precio_fraccion?: number | null;
}

export interface CreateProductoPayload {
  id_establecimiento: string; // tomado del usuario logueado
  id_tipo?: number | null;
  id_categoria?: string | null;
  id_proveedor?: number | null;
  nombre_producto: string;
  descripcion?: string | null;
  fraccion?: number; // default 1
  costo?: number; // default 0
  costo_fraccion?: number | null;
  precio: number;
  precio_fraccion?: number | null;
}

export interface UpdateProductoPayload {
  id_tipo?: number | null;
  id_categoria?: string | null;
  id_proveedor?: number | null;
  nombre_producto?: string;
  descripcion?: string | null;
  fraccion?: number;
  costo?: number;
  costo_fraccion?: number | null;
  precio?: number;
  precio_fraccion?: number | null;
}

export interface IProductosService {
  getAll(): Promise<Producto[]>;
  getById(id: number): Promise<Producto>;
  getByEstablecimiento(id_establecimiento: string): Promise<Producto[]>;
  search(params: {
    q?: string;
    tipo?: number;
    categoria?: string;
    proveedor?: number;
    pmin?: number;
    pmax?: number;
    cmin?: number;
    cmax?: number;
    est?: string;
  }): Promise<Producto[]>;
  create(payload: CreateProductoPayload): Promise<{ id_producto: number }>;
  update(id: number, payload: UpdateProductoPayload): Promise<{ id_producto: number }>;
  deleteOne(id: number): Promise<void>;
}

const getAll = (): Promise<Producto[]> => {
  return http<Producto[]>('/productos', { method: 'GET' });
};

const getById = (id: number): Promise<Producto> => {
  return http<Producto>(`/productos/${id}`, { method: 'GET' });
};

const getByEstablecimiento = (id_establecimiento: string): Promise<Producto[]> => {
  return http<Producto[]>(`/productos/establecimiento/${encodeURIComponent(id_establecimiento)}`, { method: 'GET' });
};

const search = (paramsIn: {
  q?: string;
  tipo?: number;
  categoria?: string;
  proveedor?: number;
  pmin?: number;
  pmax?: number;
  cmin?: number;
  cmax?: number;
  est?: string;
}): Promise<Producto[]> => {
  const params = new URLSearchParams();
  if (paramsIn.q != null && paramsIn.q.trim() !== '') params.set('q', paramsIn.q.trim());
  if (paramsIn.tipo != null) params.set('tipo', String(paramsIn.tipo));
  if (paramsIn.categoria != null && paramsIn.categoria !== '') params.set('categoria', String(paramsIn.categoria));
  if (paramsIn.proveedor != null) params.set('proveedor', String(paramsIn.proveedor));
  if (paramsIn.pmin != null) params.set('pmin', String(paramsIn.pmin));
  if (paramsIn.pmax != null) params.set('pmax', String(paramsIn.pmax));
  if (paramsIn.cmin != null) params.set('cmin', String(paramsIn.cmin));
  if (paramsIn.cmax != null) params.set('cmax', String(paramsIn.cmax));
  if (paramsIn.est != null && paramsIn.est !== '') params.set('est', String(paramsIn.est));
  return http<Producto[]>(`/productos/search?${params.toString()}`, { method: 'GET' });
};

const create = (payload: CreateProductoPayload): Promise<{ id_producto: number }> => {
  return http<{ id_producto: number }>('/productos', { method: 'POST', body: omitNullish(payload) });
};

const update = (id: number, payload: UpdateProductoPayload): Promise<{ id_producto: number }> => {
  return http<{ id_producto: number }>(`/productos/${id}`, { method: 'PUT', body: omitNullish(payload) });
};

const deleteOne = (id: number): Promise<void> => {
  return http<void>(`/productos/${id}`, { method: 'DELETE' });
};

export const ProductosService: IProductosService = {
  getAll,
  getById,
  getByEstablecimiento,
  search,
  create,
  update,
  deleteOne
};
