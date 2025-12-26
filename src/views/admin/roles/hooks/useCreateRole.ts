import { useCallback, useState } from 'react';
import notify from '#/utils/notify';
import { getErrorMessage, getErrorStatus } from '#/utils/errorUtils';
import { RolesService } from '#/services/roles/rolesService';
import type { CreateRolPayload, Rol } from '#/views/admin/roles';

export function useCreateRole() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (payload: CreateRolPayload, token?: string): Promise<Rol | null> => {
    setIsLoading(true);
    try {
      const rol = await RolesService.create(payload, token);
      notify.success('Rol creado correctamente');
      return rol;
    } catch (error) {
      const status = getErrorStatus(error);
      const msg = getErrorMessage(error, 'Error al crear rol');
      if (status === 422) {
        notify.warning(msg || 'Datos inválidos');
      } else if (status === 401) {
        notify.warning(msg || 'Sesión expirada');
      } else if (status === 404) {
        notify.info(msg || 'Recurso no encontrado');
      } else if (status === 500 || status === 503) {
        notify.error(msg || 'Error interno del servidor');
      } else {
        notify.error(msg);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading };
}
