import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from '../../features/auth/context';
import type { User, AuthContextType } from '../../features/auth/types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Aquí iría la lógica de autenticación real
    console.log('Login attempt:', { email, password });
    
    // Simulación de login exitoso
    setUser({
      id: '1',
      name: 'Usuario Demo',
      email: email,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

