export const API_BASE: string = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

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
