import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

export interface RolSelect {
  id_rol: number;
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

export function useRoles() {
  const { token } = useAuth();

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [roles, setRoles] = useState<RolSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Primero intentamos con el endpoint específico para select
      let res = await fetch(`${API_BASE}/roles/select`, { headers });
      
      // Si no existe, intentamos con el endpoint general
      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_BASE}/roles`, { headers });
      }
      
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<RolSelect[]>(raw) || !raw.success) {
        const msg = isApiResponse<RolSelect[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      
      // Manejar la respuesta
      const list: RolSelect[] = Array.isArray(raw.data) ? raw.data : [];
      setRoles(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudieron cargar roles';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [headers]);

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