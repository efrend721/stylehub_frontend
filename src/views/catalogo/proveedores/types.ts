export interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  direccion?: string | null;
  telefono?: string | null;
  representante?: string | null;
  telefono_representante?: string | null;
  activo: 0 | 1;
}

export interface CreateProveedorPayload {
  nombre_proveedor: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
  telefono_representante?: string;
  activo?: 0 | 1;
}

export interface UpdateProveedorPayload {
  nombre_proveedor?: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
  telefono_representante?: string;
  activo?: 0 | 1;
}
