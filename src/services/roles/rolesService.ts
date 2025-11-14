import { http } from '../apiClient/http';
import type { Rol } from '../../views/admin/roles/types';
import type { RolSelect } from '../../views/admin/usuarios/useRoles';

export const RolesService = {
  getAll(token?: string) {
    return http<Rol[]>('/roles', { token });
  },
  getForSelect(token?: string) {
    // intento select luego fallback
    return http<RolSelect[]>('/roles/select', { token }).catch(() => http<RolSelect[]>('/roles', { token }));
  },
  update(rol: Rol, token?: string) {
    const payload = {
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      estado: rol.estado
    };
    return http<unknown>(`/roles/${encodeURIComponent(String(rol.id_rol))}`, { method: 'PUT', body: payload, token });
  },
  deleteOne(id: number, token?: string) {
    return http<unknown>(`/roles/${encodeURIComponent(String(id))}`, { method: 'DELETE', token });
  },
  deleteMultiple(ids: (string|number)[], token?: string) {
    // No existe endpoint masivo en código original, se hará uno a uno
    return Promise.all(ids.map(i => RolesService.deleteOne(Number(i), token)));
  }
};
