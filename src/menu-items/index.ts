// Dynamic menu entrypoint backed by the API endpoint
// Exposes a small helper to fetch menus outside of React if needed.

import type { BackendMenuItem } from '#/types/menu';

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export async function fetchMenuFromAPI(): Promise<BackendMenuItem[]> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

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

  const res = await fetch(`${API_BASE}/menus`, { method: 'GET', headers });
  const raw: unknown = await res.json().catch(() => ({}));

  if (!res.ok || !isApiResponse<BackendMenuItem[]>(raw) || !raw.success) {
    const msg = isApiResponse<BackendMenuItem[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return Array.isArray(raw.data) ? raw.data : [];
}

export default { fetchMenuFromAPI };
