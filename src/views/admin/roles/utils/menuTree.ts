import type { RoleMenuItem } from '#/types/menu';

export const setAllChildren = (items: RoleMenuItem[], checked: boolean): RoleMenuItem[] => {
  return items.map((item) => {
    const newItem: RoleMenuItem = { ...item, asignado: checked };
    if (newItem.children) {
      newItem.children = setAllChildren(newItem.children, checked);
    }
    return newItem;
  });
};

export const setNodeAndDescendants = (
  items: RoleMenuItem[],
  targetId: number,
  checked: boolean
): RoleMenuItem[] => {
  return items.map((item) => {
    if (item.id_menu_item === targetId) {
      const newItem: RoleMenuItem = { ...item, asignado: checked };
      if (newItem.children) {
        newItem.children = setAllChildren(newItem.children, checked);
      }
      return newItem;
    }
    if (item.children) {
      return { ...item, children: setNodeAndDescendants(item.children, targetId, checked) };
    }
    return item;
  });
};

export const updateParentsBasedOnChildren = (items: RoleMenuItem[]): RoleMenuItem[] => {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      const updatedChildren = updateParentsBasedOnChildren(item.children);
      const shouldBeChecked = updatedChildren.some((child) => !!child.asignado);
      return {
        ...item,
        children: updatedChildren,
        asignado: shouldBeChecked
      };
    }
    return item;
  });
};

export const getAllAssignedIds = (items: RoleMenuItem[]): number[] => {
  let ids: number[] = [];
  items.forEach((item) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    // PBAC: persistir asignación a nivel de hoja (items finales). Los nodos contenedores se derivan.
    if (item.asignado && !hasChildren) ids.push(item.id_menu_item);
    if (item.children) ids = ids.concat(getAllAssignedIds(item.children));
  });
  return ids;
};
