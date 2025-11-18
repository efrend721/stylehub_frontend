import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { RolesService } from '#/services';
import { getErrorMessage } from '#/utils/errorUtils';

// API handled via RolesService

export interface RolSelect {
  id_rol: number;
  nombre: string;
}

// Response helpers centralizados en services

export function useRoles() {
  const { token } = useAuth();

  // headers gestionados por el servicio

  const [roles, setRoles] = useState<RolSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await RolesService.getForSelect(token || undefined);
      setRoles(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudieron cargar roles'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    fetchRoles
  };
}