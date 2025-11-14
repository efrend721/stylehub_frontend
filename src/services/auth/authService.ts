import { http } from '../apiClient/http';

export interface LoginCredentials { 
  usuario_acceso: string; 
  contrasena: string; 
}

export interface AuthResponse { 
  token: string; 
  user: unknown; 
  [k: string]: unknown; 
}

export const AuthService = {
  login(credentials: LoginCredentials) {
    return http<AuthResponse>('/auth/login', { method: 'POST', body: credentials });
  },
  register(data: Record<string, unknown>) {
    return http<unknown>('/auth/register', { method: 'POST', body: data });
  },
  logout(token?: string) {
    // algunas APIs no devuelven cuerpo útil
    return http<unknown>('/auth/logout', { method: 'POST', token });
  }
};
