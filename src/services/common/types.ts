function normalizeBaseUrl(url: string): string {
  // Evitar dobles slashes al concatenar `${API_BASE}${path}`
  return url.replace(/\/+$/, '');
}

// Preferencia:
// 1) VITE_APP_API_URL (build-time)
// 2) Producción: mismo origen + /api (típico reverse-proxy)
// 3) Desarrollo: localhost
const fallbackBase = import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:1234';
export const API_BASE: string = normalizeBaseUrl(import.meta.env.VITE_APP_API_URL || fallbackBase);

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === 'boolean';
}

export function createHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
