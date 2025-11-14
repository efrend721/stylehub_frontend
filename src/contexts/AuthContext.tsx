import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notify from '#/utils/notify';
import { AuthService } from '#/services';

// Types
export interface User {
  id_usuario_uuid: string;
  usuario_acceso: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string;
  correo_electronico: string;
  id_rol: number;
  id_establecimiento: string;
  estado: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_ultimo_acceso: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  usuario_acceso: string;
  contrasena: string;
}

export interface RegisterData {
  usuario_acceso: string;
  contrasena: string;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  telefono?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    insertId: number;
    usuario_acceso: string;
  };
  message: string;
}

export interface ValidationError {
  code: string;
  path: string[];
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
  total: null;
  timestamp: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials, remember?: boolean) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  // const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  const readStoredAuth = () => {
    try {
      // Prefer sessionStorage (no "mantenerme"), fallback to localStorage (remembered)
      const sToken = sessionStorage.getItem('auth_token');
      const sUser = sessionStorage.getItem('auth_user');
      if (sToken && sUser) return { token: sToken, userData: sUser };

      const lToken = localStorage.getItem('auth_token');
      const lUser = localStorage.getItem('auth_user');
      if (lToken && lUser) return { token: lToken, userData: lUser };
    } catch {}
    return { token: null as string | null, userData: null as string | null };
  };

  // Check for existing auth on app start
  useEffect(() => {
    const { token, userData } = readStoredAuth();

    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        notify.error('No se pudo parsear usuario almacenado. Se ha cerrado la sesión.');
        clearAuth();
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials, remember: boolean = true): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const payload = await AuthService.login(credentials);
      const { token, user } = payload as { token: string; user: User };

        // Store per preference: remember -> localStorage, else sessionStorage
        try {
          if (remember) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            // ensure session copies are cleared
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_user');
          } else {
            sessionStorage.setItem('auth_token', token);
            sessionStorage.setItem('auth_user', JSON.stringify(user));
            // ensure local copies are cleared
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } catch {}

        // Update state
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
  const responseData: AuthResponse = { success: true, data: { token, user }, message: 'Login exitoso', total: null, timestamp: new Date().toISOString() };
      return responseData;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));

      if (error instanceof Error) {
        // Preservar mensajes por códigos si es ApiError
  const status = (error as { status?: number }).status;
        if (status === 422) {
          notify.warning(error.message || 'Los datos proporcionados no son válidos');
        } else if (status === 401) {
          notify.warning(error.message || 'Error de autenticación');
        } else if (status === 404) {
          notify.info(error.message || 'Recurso no encontrado');
        } else if (status === 500 || status === 503) {
          notify.error(error.message || 'Error interno del servidor');
        }
        // Manejar errores de conexión específicamente
        if (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
          const connectionMsg = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:1234';
          notify.error(connectionMsg);
          throw new Error(connectionMsg);
        }

        // Otros errores (fallas esperadas de autenticación): no registrar en consola para evitar trazas ruidosas
        throw error;
      } else {
        const unknownMsg = 'Error desconocido al iniciar sesión';
        throw new Error(unknownMsg);
      }
    }
  };

  const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await AuthService.register(userData as unknown as Record<string, unknown>);
      setState((prev) => ({ ...prev, isLoading: false }));
      const ok: RegisterResponse = { success: true, data: { insertId: 0, usuario_acceso: userData.usuario_acceso }, message: 'Registro exitoso' } as RegisterResponse;
      return ok;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      if (error instanceof Error) {
        // Errores esperados en registro
  const status = (error as { status?: number }).status;
        if (status === 422) {
          notify.warning(error.message || 'Datos inválidos');
        } else if (status === 500 || status === 503) {
          if (error.message && error.message.includes('duplicado')) {
            notify.error('Ya existe un usuario con ese correo electrónico o nombre de usuario');
          } else {
            notify.error(error.message || 'Error interno del servidor');
          }
        } else {
          notify.error(error.message || 'Error en el registro');
        }
        throw error; // Re-lanzar para que el componente lo capture
      } else {
        throw new Error('Error desconocido en el registro');
      }
    }
  };

  const getAnyToken = (): string | null => {
    try {
      return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = getAnyToken();
      if (token) {
        await AuthService.logout(token);
      }
    } catch (error) {
      if (import.meta.env.MODE !== 'production') {
        console.warn('Fallo al llamar logout API (continuando de forma local):', error);
      }
      // Continue with local logout even if API call fails
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    } catch {}
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearAuth
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
