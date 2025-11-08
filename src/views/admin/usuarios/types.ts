// Tipos del dominio para Usuarios
export interface Usuario {
  usuario_acceso: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string | null;
  correo_electronico: string;
  id_rol: number;
  id_establecimiento: string;
  estado: number; // 1 activo, 0 inactivo
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_ultimo_acceso: string | null;
}

// Tipo para editar un usuario existente
export interface UsuarioEdit {
  usuario_acceso: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string | null;
  correo_electronico: string;
  id_rol: number;
  id_establecimiento: string;
  estado: number;
  contrasena?: string; // Opcional para edición
}

// Tipo para crear un nuevo usuario
export interface NuevoUsuario {
  usuario_acceso: string;
  contrasena: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string;
  correo_electronico: string;
  id_rol: number;
  id_establecimiento: string;
  estado: number;
}
