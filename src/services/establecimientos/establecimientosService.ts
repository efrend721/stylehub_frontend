import { http } from '../apiClient/http';
import type { Establecimiento, UpdateEstablecimientoDTO, EstablecimientoTipo } from '#/views/sysConfig/establecimientos';
import type { EstablecimientoSelect } from '../../views/admin/usuarios/useEstablecimientos';

export const EstablecimientosService = {
  getForSelect(token?: string) {
    return http<EstablecimientoSelect[]>('/establecimientos/select', { token });
  },
  getById(id: string, token?: string) {
    return http<Establecimiento>(`/establecimientos/${id}`, { token });
  },
  update(id: string, changes: UpdateEstablecimientoDTO, token?: string) {
    return http<void>(`/establecimientos/${id}`, { method: 'PATCH', body: changes, token });
  },
  getTipos(token?: string) {
    return http<EstablecimientoTipo[]>('/establecimientos/tipos', { token });
  }
};
