import { http } from '../apiClient/http';

export interface LoginCredentials { 
  usuario_acceso: string; 
  contrasena: string; 
}

// Respuesta del backend: { user: User } - NO incluye token en el body
export interface AuthResponse { 
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
  logout() {
    // El backend eliminará la cookie httpOnly automáticamente
    return http<unknown>('/auth/logout', { method: 'POST' });
  },
  me() {
    // Obtener usuario actual usando la cookie httpOnly (credentials: 'include')
    // silent: true para no mostrar errores en DevTools cuando no hay sesión activa
    return http<unknown>('/auth/me', { method: 'GET', silent: true });
  }
};
