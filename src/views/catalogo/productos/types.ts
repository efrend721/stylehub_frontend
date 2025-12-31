import type { Producto as ProductoType, CreateProductoPayload as CreatePayload, UpdateProductoPayload as UpdatePayload } from '#/services/productos/productosService';

export type Producto = ProductoType;
export type CreateProductoPayload = CreatePayload;
export type UpdateProductoPayload = UpdatePayload;

export interface Option<T = string | number> {
  value: T;
  label: string;
}

export interface ProductosFilters {
  id_tipo: number | '' | null;
  id_categoria: string | '' | null;
  id_proveedor: number | '' | null;
  precio_min: string; // allow empty while typing
  precio_max: string;
  costo_min: string;
  costo_max: string;
}
