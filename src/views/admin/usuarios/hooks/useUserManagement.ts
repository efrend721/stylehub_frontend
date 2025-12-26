import { useMemo } from 'react';
import { useAuth } from '#/contexts/AuthContext';

type WithEstablecimiento = { id_establecimiento?: string | null };

export function useUserManagement() {
  const { user } = useAuth();

  const idEstablecimiento = useMemo(() => {
    const raw = user?.id_establecimiento;
    return raw && typeof raw === 'string' ? raw : undefined;
  }, [user]);

  const isOperativoAdmin = user?.id_rol === 2;

  const attachEstablecimiento = <T extends WithEstablecimiento>(payload: T): T & { id_establecimiento: string } => {
    if (!idEstablecimiento) {
      throw new Error('No se encontró el establecimiento del usuario autenticado');
    }
    return { ...payload, id_establecimiento: idEstablecimiento } as T & { id_establecimiento: string };
  };

  return { idEstablecimiento, isOperativoAdmin, attachEstablecimiento };
}

export default useUserManagement;