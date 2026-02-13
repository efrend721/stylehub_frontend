// Tipos del dominio para Tipos de Artículo
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
