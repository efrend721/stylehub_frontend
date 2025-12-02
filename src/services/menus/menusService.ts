import { http } from '../apiClient/http';
import type { BackendMenuItem, RoleMenuItem } from '#/types/menu';

interface IMenusService {
  getMenus(): Promise<BackendMenuItem[]>;
  getRoleMenus(idRol: number): Promise<RoleMenuItem[]>;
}

export const MenusService: IMenusService = {
  getMenus() {
    // La cookie httpOnly se envía automáticamente con credentials: 'include'
    return http<BackendMenuItem[]>('/menus', { method: 'GET' });
  },
  getRoleMenus(idRol: number) {
    return http<RoleMenuItem[]>(`/roles/${idRol}/menus`, { method: 'GET' });
  }
};
