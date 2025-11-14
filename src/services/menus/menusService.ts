import { http } from '../apiClient/http';
import type { BackendMenuItem } from '#/types/menu';

export const MenusService = {
  getMenus() {
    // La cookie httpOnly se envía automáticamente con credentials: 'include'
    return http<BackendMenuItem[]>('/menus', { method: 'GET' });
  }
};
