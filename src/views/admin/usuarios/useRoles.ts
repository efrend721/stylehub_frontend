import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { RolesService } from '#/services';
import { getErrorMessage } from '#/utils/errorUtils';
import { hasRole } from '#/utils/auth/roleUtils';
import type { RolSelect } from '#/views/admin/roles';

// API handled via RolesService

// Response helpers centralizados en services

export function useRoles() {
  const { token, user } = useAuth();

  // headers gestionados por el servicio

  const [roles, setRoles] = useState<RolSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const scope: 'all' | 'operativos' = hasRole(user, 2) ? 'operativos' : 'all';
      const list = await RolesService.getForSelect(scope, token || undefined);
      setRoles(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudieron cargar roles'));
    } finally {
      setLoading(false);
    }
  }, [token, user]);

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