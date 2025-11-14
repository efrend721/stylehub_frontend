import { http } from '../apiClient/http';
import type { EstablecimientoSelect } from '../../views/admin/usuarios/useEstablecimientos';

export const EstablecimientosService = {
  getForSelect(token?: string) {
    return http<EstablecimientoSelect[]>('/establecimientos/select', { token });
  }
};
