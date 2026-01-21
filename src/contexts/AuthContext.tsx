import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notify from '#/utils/notify';
import { AuthService } from '#/services';
import { API_BASE } from '#/services/common/types';
import { setUnauthorizedHandler } from '#/services/apiClient/authEvents';

// Types
export interface User {
  id_usuario_uuid: string;
  usuario_acceso: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string;
  correo_electronico: string;
  id_rol: number;
  // PBAC / multirol (compatibilidad: el backend puede enviar roles[])
  roles?: number[];
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
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Verificar autenticación al cargar (el backend validará la cookie httpOnly)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Llamar al endpoint /auth/me que usa la cookie httpOnly automáticamente
        const user = (await AuthService.me()) as User | null;
        // Si no hay usuario (sesión no activa), establecer como no autenticado
        if (!user) {
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          return;
        }

        setState({
          user,
          token: null, // El token está en httpOnly cookie, no lo guardamos en el estado
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        // Errores inesperados (no relacionados con autenticación)
        console.warn('Error inesperado al verificar autenticación:', error);
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    void checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials, _remember: boolean = true): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const payload = await AuthService.login(credentials);
      // El backend envía: { user: User } - NO incluye token en el body
      const { user } = payload as { user: User };
      // El token se guarda automáticamente en httpOnly cookie por el backend
      // No necesitamos guardarlo en localStorage/sessionStorage
      // El parámetro 'remember' está disponible para enviar al backend en el futuro
      // para configurar la expiración de la cookie (ej: 30 días vs 24 horas)

      setState({
        user,
        token: null, // No guardamos el token en el estado (está en cookie httpOnly)
        isAuthenticated: true,
        isLoading: false
      });

      const responseData: AuthResponse = {
        success: true,
        data: { token: '', user }, // Token vacío ya que está en cookie
        message: 'Login exitoso',
        total: null,
        timestamp: new Date().toISOString()
      };
      return responseData;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));

      if (error instanceof Error) {
        // Preservar mensajes por códigos si es ApiError
        const status = (error as { status?: number }).status;
        const errorMsg = error.message;
        if (status === 422) {
          notify.warning(errorMsg || 'Los datos proporcionados no son válidos');
        } else if (status === 401) {
          notify.warning(errorMsg || 'Error de autenticación');
        } else if (status === 404) {
          notify.info(errorMsg || 'Recurso no encontrado');
        } else if (status === 500 || status === 503) {
          notify.error(errorMsg || 'Error interno del servidor');
        }
        // Manejar errores de conexión específicamente
        if (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
          const connectionMsg = import.meta.env.PROD
            ? 'No se puede conectar al servidor. Intenta nuevamente en unos momentos.'
            : `No se puede conectar al servidor. Verifica que el backend esté ejecutándose y accesible en ${API_BASE}`;
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
      const ok: RegisterResponse = {
        success: true,
        data: { insertId: 0, usuario_acceso: userData.usuario_acceso },
        message: 'Registro exitoso'
      } as RegisterResponse;
      return ok;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      if (error instanceof Error) {
        // Errores esperados en registro
        const status = (error as { status?: number }).status;
        const errorMsg = error.message;
        if (status === 422) {
          notify.warning(errorMsg || 'Datos inválidos');
        } else if (status === 500 || status === 503) {
          if (errorMsg && errorMsg.includes('duplicado')) {
            notify.error('Ya existe un usuario con ese correo electrónico o nombre de usuario');
          } else {
            notify.error(errorMsg || 'Error interno del servidor');
          }
        } else {
          notify.error(errorMsg || 'Error en el registro');
        }
        throw error; // Re-lanzar para que el componente lo capture
      } else {
        throw new Error('Error desconocido en el registro');
      }
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Llamar al backend para eliminar la cookie httpOnly
      await AuthService.logout();
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
    // Limpiar cualquier dato residual en storage (por migración)
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

  // Handler global: si una request retorna 401, limpiar sesión y dejar que AuthGuard redirija
  useEffect(() => {
    setUnauthorizedHandler(({ message } = {}) => {
      // Evitar ruido en login screen: igual limpiamos estado.
      clearAuth();

      if (import.meta.env.MODE !== 'production' && message) {
        console.warn('[auth] 401 unauthorized:', message);
      }

      // Mantener el mensaje del backend cuando exista
      notify.warning(message || 'Tu sesión ha expirado. Inicia sesión nuevamente.');
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

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
