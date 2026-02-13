import { http } from '#/services/apiClient/http';

const ARTICULOS_BASE_PATH = '/articulos';

function omitNullish<T extends object>(payload: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(payload) as Array<keyof T>) {
    const value = payload[key];
    if (value === null || value === undefined) continue;
    out[key] = value;
  }
  return out;
}

// Types
export interface Articulo {
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

export interface CreateArticuloPayload {
  id_establecimiento: string; // tomado del usuario logueado
  id_tipo?: number | null;
  id_categoria?: string | null;
  id_proveedor?: number | null;
  nombre_producto: string;
  descripcion?: string | null;
  fraccion?: number; // default 1
  costo?: number; // default 0
  costo_fraccion?: number | null;
  // Nota: puede omitirse por field-level PBAC (ej: el usuario crea pero no puede fijar precio)
  // y el backend decide el valor por defecto/validación.
  precio?: number;
  precio_fraccion?: number | null;
}

export interface UpdateArticuloPayload {
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

export interface IArticulosService {
  getAll(): Promise<Articulo[]>;
  getById(id: number): Promise<Articulo>;
  getByEstablecimiento(id_establecimiento: string): Promise<Articulo[]>;
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
  }): Promise<Articulo[]>;
  create(payload: CreateArticuloPayload): Promise<{ id_producto: number }>;
  update(id: number, payload: UpdateArticuloPayload): Promise<{ id_producto: number }>;
  deleteOne(id: number): Promise<void>;
}

const getAll = (): Promise<Articulo[]> => {
  return http<Articulo[]>(ARTICULOS_BASE_PATH, { method: 'GET' });
};

const getById = (id: number): Promise<Articulo> => {
  return http<Articulo>(`${ARTICULOS_BASE_PATH}/${id}`, { method: 'GET' });
};

const getByEstablecimiento = (id_establecimiento: string): Promise<Articulo[]> => {
  return http<Articulo[]>(
    `${ARTICULOS_BASE_PATH}/establecimiento/${encodeURIComponent(id_establecimiento)}`,
    { method: 'GET' }
  );
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
}): Promise<Articulo[]> => {
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
  return http<Articulo[]>(`${ARTICULOS_BASE_PATH}/search?${params.toString()}`, { method: 'GET' });
};

const create = (payload: CreateArticuloPayload): Promise<{ id_producto: number }> => {
  return http<{ id_producto: number }>(ARTICULOS_BASE_PATH, { method: 'POST', body: omitNullish(payload) });
};

const update = (id: number, payload: UpdateArticuloPayload): Promise<{ id_producto: number }> => {
  return http<{ id_producto: number }>(`${ARTICULOS_BASE_PATH}/${id}`, { method: 'PUT', body: omitNullish(payload) });
};

const deleteOne = (id: number): Promise<void> => {
  return http<void>(`${ARTICULOS_BASE_PATH}/${id}`, { method: 'DELETE' });
};

export const ArticulosService: IArticulosService = {
  getAll,
  getById,
  getByEstablecimiento,
  search,
  create,
  update,
  deleteOne
};

// Alias temporal para compatibilidad interna durante la transición.
// TODO: eliminar cuando ya no existan imports antiguos.
export const ProductosService: IArticulosService = ArticulosService;
