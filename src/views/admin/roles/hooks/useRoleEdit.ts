import { useCallback, useEffect, useState } from 'react';
import notify from '#/utils/notify';
import { getErrorMessage } from '#/utils/errorUtils';
import { RolesService } from '#/services/roles/rolesService';
import { MenusService } from '#/services/menus/menusService';
import type { Rol } from '#/views/admin/roles';
import type { RoleMenuItem } from '#/types/menu';
import { setNodeAndDescendants, updateParentsBasedOnChildren, getAllAssignedIds } from '../utils/menuTree';

export function useRoleEdit(roleId: number | undefined) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Rol | null>(null);
  const [menus, setMenus] = useState<RoleMenuItem[]>([]);

  const fetchData = useCallback(async () => {
    if (!roleId) return;
    setLoading(true);
    setError(null);
    try {
      const [roleData, menusData] = await Promise.all([
        RolesService.getById(Number(roleId)),
        MenusService.getRoleMenus(Number(roleId))
      ]);
      setRole(roleData);
      setMenus(menusData);
    } catch (e) {
      const msg = getErrorMessage(e, 'Error al cargar datos del rol');
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRoleChange = (field: keyof Rol, value: string | number) => {
    if (!role) return;
    setRole({ ...role, [field]: value });
  };

  const handleMenuToggle = (menuId: number, checked: boolean) => {
    setMenus((prev) => updateParentsBasedOnChildren(setNodeAndDescendants(prev, menuId, checked)));
  };

  const save = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const assignedMenuIds = getAllAssignedIds(menus);
      await RolesService.update(role, assignedMenuIds);
      notify.success('Rol actualizado correctamente');
    } catch (e) {
      notify.error(getErrorMessage(e, 'Error al guardar cambios'));
    } finally {
      setSaving(false);
    }
  };

  return { loading, saving, error, role, menus, handleRoleChange, handleMenuToggle, save };
}
