// Dynamic menu entrypoint backed by the API endpoint
// Exposes a small helper to fetch menus outside of React if needed.

import type { BackendMenuItem } from '#/types/menu';
import { MenusService } from '#/services';

// API base gestionado en services

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export async function fetchMenuFromAPI(): Promise<BackendMenuItem[]> {
  const token = getAuthToken() || undefined;
  const data = await MenusService.getMenus(token);
  return Array.isArray(data) ? data : [];
}

export default { fetchMenuFromAPI };
