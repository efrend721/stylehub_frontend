// Tipos del dominio para Roles
export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: number; // 1 activo, 0 inactivo
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface RolSelect {
  id_rol: number;
  nombre: string;
}

// Payload para creación de rol (POST /roles)
export interface CreateRolPayload {
  nombre: string; // 2 - 50 caracteres
  descripcion?: string; // Máx. 100 caracteres
  estado?: 0 | 1; // Por defecto 1
}
