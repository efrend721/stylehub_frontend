import { useState } from 'react';
import { useAuth } from './useAuth';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
  };
};