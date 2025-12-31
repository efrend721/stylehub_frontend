// Tipos del dominio para Tipos de Producto
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
