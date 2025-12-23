export type Level = { label: string; color: string } | null;

export type RegisterFormData = {
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  usuario_acceso: string;
  contrasena: string;
  telefono: string;
};

export type RegisterFieldErrors = Partial<{
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  telefono: string;
  usuario_acceso: string;
  contrasena: string;
}>;

export interface AuthRegisterAlertsProps {
  severity: 'error' | 'success';
  message: string;
}
