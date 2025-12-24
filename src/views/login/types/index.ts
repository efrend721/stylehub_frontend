export type LoginFormData = {
  usuario_acceso: string;
  contrasena: string;
};

export type LoginFieldErrors = Partial<{
  usuario_acceso: string;
  contrasena: string;
}>;

export interface AuthLoginAlertsProps {
  severity: 'error' | 'success';
  message: string;
}
