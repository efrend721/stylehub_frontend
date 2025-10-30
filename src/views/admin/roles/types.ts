// Tipos del dominio para Roles
export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: number; // 1 activo, 0 inactivo
  fecha_creacion: string;
  fecha_actualizacion: string;
}
