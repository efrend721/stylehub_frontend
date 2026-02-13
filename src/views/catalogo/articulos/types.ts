import type { Articulo as ArticuloType, CreateArticuloPayload as CreatePayload, UpdateArticuloPayload as UpdatePayload } from '#/services/articulos/articulosService';

export type Articulo = ArticuloType;
export type CreateArticuloPayload = CreatePayload;
export type UpdateArticuloPayload = UpdatePayload;

export interface Option<T = string | number> {
  value: T;
  label: string;
}

export interface ArticulosFilters {
  id_tipo: number | '' | null;
  id_categoria: string | '' | null;
  id_proveedor: number | '' | null;
  precio_min: string; // allow empty while typing
  precio_max: string;
  costo_min: string;
  costo_max: string;
}
