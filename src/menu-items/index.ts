// Dynamic menu entrypoint backed by the API endpoint
// Exposes a small helper to fetch menus outside of React if needed.

import type { BackendMenuItem } from 'types/menu';

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

  const res = await fetch(`${API_BASE}/menus`, { method: 'GET', headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  return Array.isArray(json.data) ? (json.data as BackendMenuItem[]) : [];
}

export default { fetchMenuFromAPI };
