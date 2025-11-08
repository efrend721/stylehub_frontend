import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

export interface EstablecimientoSelect {
  id_establecimiento: string;
  nombre: string;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === 'boolean';
}

export function useEstablecimientos() {
  const { token } = useAuth();

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [establecimientos, setEstablecimientos] = useState<EstablecimientoSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablecimientos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/establecimientos/select`, { headers });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<EstablecimientoSelect[]>(raw) || !raw.success) {
        const msg = isApiResponse<EstablecimientoSelect[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const list = Array.isArray(raw.data) ? raw.data : [];
      setEstablecimientos(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudieron cargar establecimientos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [headers]);

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