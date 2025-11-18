import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import { EstablecimientosService } from '#/services';
import { getErrorMessage } from '#/utils/errorUtils';

// API base gestionado por servicios

export interface EstablecimientoSelect {
  id_establecimiento: string;
  nombre: string;
}

// Helpers de respuesta centralizados en services

export function useEstablecimientos() {
  const { token } = useAuth();

  // headers manejados en el servicio

  const [establecimientos, setEstablecimientos] = useState<EstablecimientoSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablecimientos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await EstablecimientosService.getForSelect(token || undefined);
      setEstablecimientos(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(getErrorMessage(e, 'No se pudieron cargar establecimientos'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchEstablecimientos();
  }, [fetchEstablecimientos]);

  return {
    establecimientos,
    loading,
    error,
    fetchEstablecimientos
  };
}