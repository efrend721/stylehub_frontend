export interface Establecimiento {
  id_establecimiento: string;
  nombre: string | null;
  direccion: string | null;
  telefono?: string | null;
  celular?: string | null;
  nit: string | null;
  resolucion?: string | null;
  desde?: string | null; // Código inicio
  hasta?: string | null; // Código fin
  mensaje1?: string | null;
  mensaje2?: string | null;
  mensaje3?: string | null;
  mensaje4?: string | null;
  fecha_ini?: string | null; // YYYY-MM-DD
  fecha_fin?: string | null; // YYYY-MM-DD
  id_tipo?: number | null;
  estado?: number; // 1 activo, 0 inactivo
}

export type UpdateEstablecimientoDTO = Partial<Establecimiento>;

export interface EstablecimientoTipo {
  id_tipo: number;
  descripcion: string;
}
