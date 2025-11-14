// Dynamic menu entrypoint backed by the API endpoint
// Exposes a small helper to fetch menus outside of React if needed.

import type { BackendMenuItem } from '#/types/menu';
import { MenusService } from '#/services';

// API base gestionado en services
// El token ahora se envía automáticamente vía httpOnly cookie, no necesitamos localStorage

export async function fetchMenuFromAPI(): Promise<BackendMenuItem[]> {
  // La cookie httpOnly se envía automáticamente con credentials: 'include'
  const data = await MenusService.getMenus();
  return Array.isArray(data) ? data : [];
}

export default { fetchMenuFromAPI };
