import { http } from '../apiClient/http';
import type { BackendMenuItem } from '#/types/menu';

export const MenusService = {
  getMenus(token?: string) {
    return http<BackendMenuItem[]>('/menus', { method: 'GET', token });
  }
};
