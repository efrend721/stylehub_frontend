import { useAuth } from '#/contexts/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { http } from '#/services/apiClient/http';
import { AdminMenusService } from '#/services/menus/adminMenusService';
import notify from '#/utils/notify';
import { getErrorMessage } from '#/utils/errorUtils';
import { buildTituloById } from '#/views/admin/menus/utils';
import { type IdKeyOption, type MenuTreeNodeLocal } from '#/views/admin/menus/types';

export function useMenuAdmin() {
  const { token } = useAuth();

  const [tree, setTree] = useState<MenuTreeNodeLocal[] | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [groupTitulo, setGroupTitulo] = useState('');
  const [groupIdKey, setGroupIdKey] = useState('');
  const [itemTitulo, setItemTitulo] = useState('');
  const [itemIdKey, setItemIdKey] = useState('');
  const [itemUrl, setItemUrl] = useState('/dashboard');
  const [itemIcon, setItemIcon] = useState<string>('');
  const [parentId, setParentId] = useState<number | ''>('');

  const [creationType, setCreationType] = useState<'' | 'group' | 'item'>('');
  const [editingNode, setEditingNode] = useState<MenuTreeNodeLocal | null>(null);
  const isEditingGroup = editingNode?.tipo === 'group' || editingNode?.tipo === 'collapse';
  const isEditingItem = editingNode?.tipo === 'item';

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<MenuTreeNodeLocal | null>(null);

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<MenuTreeNodeLocal | null>(null);
  const [moveParent, setMoveParent] = useState<number | ''>('');

  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderTarget, setReorderTarget] = useState<MenuTreeNodeLocal | null>(null);
  const [reorderParentId, setReorderParentId] = useState<number | null | undefined>(undefined);
  const [reorderIndex, setReorderIndex] = useState<number>(0);

  const tituloById = useMemo(() => buildTituloById(tree), [tree]);

  const ICON_OPTIONS: string[] = [
    '',
    'IconDashboard',
    'IconTypography',
    'IconPalette',
    'IconShadow',
    'IconHelp',
    'IconUsers',
    'IconShield',
    'IconLayoutSidebar',
    'IconSettings',
    'IconActivity',
    'IconReport'
  ];

  const [idKeyOptions, setIdKeyOptions] = useState<IdKeyOption[]>([]);
  const [idKeyLoaded, setIdKeyLoaded] = useState(false);
  const fetchIdKeys = useCallback(async (): Promise<void> => {
    try {
      const data = await http<IdKeyOption[]>('/menus/select', { method: 'GET', token: token || undefined });
      const safe = Array.isArray(data) ? data.filter((o): o is IdKeyOption => !!o && typeof o.id_menu_item === 'number' && typeof o.id_key === 'string') : [];
      setIdKeyOptions(safe);
      setIdKeyLoaded(true);
    } catch (e) {
      notify.error(getErrorMessage(e, 'No se pudo cargar opciones de id_key'));
    }
  }, [token]);

  const loadTree = useCallback(async (): Promise<void> => {
    setLoadingTree(true);
    setTreeError(null);
    try {
      const raw = await http<MenuTreeNodeLocal[]>('/menus/admin/tree', { method: 'GET', token: token || undefined });
      const data = Array.isArray(raw) ? raw : [];
      setTree(data);
    } catch {
      setTreeError('No se pudo cargar el árbol');
      setTree(null);
    } finally {
      setLoadingTree(false);
    }
  }, [token]);

  useEffect(() => { void loadTree(); }, [loadTree]);

  useEffect(() => {
    if (creationType === 'item' && !idKeyLoaded) {
      void fetchIdKeys();
    }
  }, [creationType, idKeyLoaded, fetchIdKeys]);

  const selectedGroupKey = useMemo(() => {
    if (typeof parentId !== 'number') return '';
    const opt = idKeyOptions.find((o) => o.id_menu_item === parentId);
    return opt?.id_key ?? '';
  }, [parentId, idKeyOptions]);

  useEffect(() => {
    if (creationType !== 'item' || isEditingItem) return;
    const groupKey = selectedGroupKey.trim();
    const itemKey = itemIdKey.trim();
    const next = groupKey ? (itemKey ? `/${groupKey}/${itemKey}` : `/${groupKey}`) : '';
    setItemUrl(next);
  }, [creationType, isEditingItem, selectedGroupKey, itemIdKey]);

  const startEdit = (node: MenuTreeNodeLocal) => {
    setEditingNode(node);
    if (node.tipo === 'item') {
      setCreationType('item');
      setItemTitulo(node.titulo);
      setItemIdKey(node.id_key ?? '');
      setItemUrl(node.url ?? '');
      setItemIcon(node.icono ?? '');
      setParentId(typeof node.parent_id === 'number' ? node.parent_id : '');
    } else {
      setCreationType('group');
      setGroupTitulo(node.titulo);
      setGroupIdKey(node.id_key ?? '');
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setGroupTitulo('');
    setGroupIdKey('');
    setItemTitulo('');
    setItemIdKey('');
    setItemUrl('');
    setItemIcon('');
    setParentId('');
    setCreationType('');
  };

  const resetCreateUI = () => {
    setEditingNode(null);
    setGroupTitulo('');
    setGroupIdKey('');
    setItemTitulo('');
    setItemIdKey('');
    setItemUrl('/dashboard');
    setItemIcon('');
    setParentId('');
    setCreationType('');
  };

  const saveEditGroup = async () => {
    if (!editingNode) return;
    const payload: Record<string, unknown> = {};
    const nextTitulo = groupTitulo?.trim();
    if (typeof nextTitulo === 'string' && nextTitulo !== editingNode.titulo) payload.titulo = nextTitulo;
    const nextIdKey = groupIdKey?.trim();
    if (nextIdKey && nextIdKey !== (editingNode.id_key ?? '')) payload.id_key = nextIdKey;
    if (Object.keys(payload).length === 0) { notify.info('No hay cambios para guardar'); return; }
    setActionLoadingId(editingNode.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${editingNode.id_menu_item}`, { method: 'PUT', body: payload, token: token || undefined });
      notify.success('Grupo actualizado');
      resetCreateUI();
      void loadTree();
    } catch { notify.error('No se pudo actualizar el grupo'); } finally { setActionLoadingId(null); }
  };

  const saveEditItem = async () => {
    if (!editingNode) return;
    const payload: Record<string, unknown> = {};
    const nextTitulo = itemTitulo?.trim();
    if (typeof nextTitulo === 'string' && nextTitulo !== editingNode.titulo) payload.titulo = nextTitulo;
    const nextUrl = itemUrl?.trim();
    if (typeof nextUrl === 'string' && nextUrl !== (editingNode.url ?? '')) payload.url = nextUrl;
    const nextIcon = itemIcon?.trim();
    const currentIcon = (typeof editingNode.icono === 'string' ? editingNode.icono : '') ?? '';
    if ((nextIcon || '') !== currentIcon) { if (nextIcon) payload.icono = nextIcon; }
    const nextIdKey = itemIdKey?.trim();
    if (nextIdKey && nextIdKey !== (editingNode.id_key ?? '')) payload.id_key = nextIdKey;
    if (Object.keys(payload).length === 0) { notify.info('No hay cambios para guardar'); return; }
    setActionLoadingId(editingNode.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${editingNode.id_menu_item}`, { method: 'PUT', body: payload, token: token || undefined });
      notify.success('Item actualizado');
      resetCreateUI();
      void loadTree();
    } catch { notify.error('No se pudo actualizar el item'); } finally { setActionLoadingId(null); }
  };

  const handleCreateGroup = async () => {
    try {
      await http<{ titulo: string }>(
        '/menus/admin/groups',
        { method: 'POST', body: { id_key: groupIdKey, titulo: groupTitulo, tipo: 'group' }, token: token || undefined }
      );
      notify.success(`Grupo creado: ${groupTitulo}`);
      resetCreateUI();
      void loadTree();
    } catch { notify.error('Error creando grupo'); }
  };

  const handleCreateItem = async () => {
    try {
      const body = { id_key: itemIdKey, titulo: itemTitulo, tipo: 'item' as const, url: itemUrl, icono: itemIcon || undefined, parent_id: parentId === '' ? undefined : Number(parentId) };
      await http<{ titulo: string }>(
        '/menus/admin/items',
        { method: 'POST', body, token: token || undefined }
      );
      notify.success(`Item creado: ${itemTitulo}`);
      resetCreateUI();
      void loadTree();
    } catch { notify.error('Error creando item'); }
  };

  const deleteNode = async (node: MenuTreeNodeLocal) => {
    setActionLoadingId(node.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${node.id_menu_item}`, { method: 'DELETE', token: token || undefined });
      notify.success('Eliminado');
      if (editingNode?.id_menu_item === node.id_menu_item) setEditingNode(null);
      void loadTree();
    } catch { notify.error('No se pudo eliminar'); } finally { setActionLoadingId(null); }
  };

  const requestDelete = (node: MenuTreeNodeLocal) => { setConfirmDeleteTarget(node); setConfirmDeleteOpen(true); };
  const handleConfirmDelete = async () => { if (!confirmDeleteTarget) return; const t = confirmDeleteTarget; setConfirmDeleteOpen(false); setConfirmDeleteTarget(null); await deleteNode(t); };
  const handleCancelDelete = () => { setConfirmDeleteOpen(false); setConfirmDeleteTarget(null); };

  const reorderNode = async (node: MenuTreeNodeLocal, parentIdArg: number | null | undefined, newOrderOneBased: number | null) => {
    if (newOrderOneBased === null) return;
    setActionLoadingId(node.id_menu_item);
    try {
      if (typeof parentIdArg === 'number') {
        const res = await AdminMenusService.reorderChild(parentIdArg, node.id_menu_item, newOrderOneBased, token || undefined);
        if (res.message) notify.info(res.message);
        notify.success('Orden de submenú actualizado');
      } else {
        const res = await AdminMenusService.reorderRootGroup(node.id_menu_item, newOrderOneBased, token || undefined);
        const { effective_order, max_order, target_order, current_order, message } = res;
        if (message) notify.info(message);
        notify.success('Orden de grupo actualizado');
      }
      void loadTree();
    } catch (e) { notify.error(getErrorMessage(e, 'No se pudo reordenar')); } finally { setActionLoadingId(null); }
  };

  const parentCandidates = useMemo(() => {
    const out: Array<{ id: number; label: string; disabled?: boolean }> = [];
    const walk = (nodes?: ReadonlyArray<MenuTreeNodeLocal>) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((n: MenuTreeNodeLocal) => {
        if (n.tipo !== 'item') out.push({ id: n.id_menu_item, label: `${n.titulo} (${n.tipo})` });
        if (Array.isArray(n.children) && n.children.length) walk(n.children);
      });
    };
    walk(tree ?? undefined);
    return out;
  }, [tree]);

  const getSiblings = useCallback((parentIdArg: number | null | undefined): MenuTreeNodeLocal[] => {
    if (!Array.isArray(tree)) return [];
    if (typeof parentIdArg !== 'number') return tree;
    const stack: MenuTreeNodeLocal[] = [...tree];
    while (stack.length) {
      const n = stack.shift();
      if (!n) break;
      if (n.id_menu_item === parentIdArg) return n.children ?? [];
      if (Array.isArray(n.children)) stack.push(...n.children);
    }
    return [];
  }, [tree]);

  function requestMove(node: MenuTreeNodeLocal) { setMoveTarget(node); setMoveParent(typeof node.parent_id === 'number' ? node.parent_id : ''); setMoveOpen(true); }
  const applyMove = async () => {
    if (!moveTarget) return;
    const newParent = moveParent === '' ? undefined : Number(moveParent);
    const node = moveTarget;
    setMoveOpen(false);
    setActionLoadingId(node.id_menu_item);
    try {
      if (typeof node.parent_id === 'number') {
        await http<unknown>('/menus/admin/edges', { method: 'DELETE', body: { parent_id: node.parent_id, child_id: node.id_menu_item }, token: token || undefined }).catch(() => undefined);
      }
      if (typeof newParent === 'number') {
        await http<unknown>('/menus/admin/edges', { method: 'POST', body: { parent_id: newParent, child_id: node.id_menu_item }, token: token || undefined });
      }
      notify.success('Nodo movido');
      void loadTree();
    } catch { notify.error('No se pudo mover el nodo'); } finally { setActionLoadingId(null); setMoveTarget(null); }
  };
  function cancelMove() { setMoveOpen(false); setMoveTarget(null); }

  function requestReorder(node: MenuTreeNodeLocal, parentIdArg: number | null | undefined) {
    const siblings = getSiblings(parentIdArg);
    const currentIndex = siblings.findIndex((s) => s.id_menu_item === node.id_menu_item);
    setReorderTarget(node);
    setReorderParentId(parentIdArg);
    const safeIndexZero = currentIndex >= 0 ? currentIndex : 0;
    const maxIndexZero = Math.max(siblings.length - 1, 0);
    const initialOneBased = Math.min(safeIndexZero, maxIndexZero) + 1;
    setReorderIndex(initialOneBased);
    setReorderOpen(true);
  }
  const applyReorder = async () => {
    if (!reorderTarget) return;
    const node = reorderTarget;
    const pid = reorderParentId;
    const siblings = getSiblings(pid);
    const maxIndexOne = Math.max(siblings.length, 1);
    const idxOne = Math.min(Math.max(1, reorderIndex), maxIndexOne);
    setReorderOpen(false);
    await reorderNode(node, pid, idxOne);
    setReorderTarget(null);
  };
  const closeReorder = () => { setReorderOpen(false); };

  const reorderOptionsCount = useMemo(() => {
    const siblings = getSiblings(reorderParentId);
    return Math.max(siblings.length, 1);
  }, [reorderParentId, getSiblings]);

  const canCreateGroup = creationType === 'group' && groupIdKey.trim() !== '' && groupTitulo.trim() !== '';
  const canCreateItem = creationType === 'item' && itemIdKey.trim() !== '' && itemTitulo.trim() !== '' && itemUrl.trim() !== '' && (typeof parentId === 'number');

  return {
    // state
    tree, loadingTree, treeError, tituloById,
    creationType, setCreationType,
    editingNode, isEditingGroup, isEditingItem,
    groupTitulo, setGroupTitulo, groupIdKey, setGroupIdKey,
    itemTitulo, setItemTitulo, itemIdKey, setItemIdKey, itemUrl, setItemUrl, itemIcon, setItemIcon,
    parentId, setParentId,
    idKeyOptions, idKeyLoaded, ICON_OPTIONS,
    // actions
    loadTree, startEdit, cancelEdit, resetCreateUI,
    saveEditGroup, saveEditItem, handleCreateGroup, handleCreateItem,
    // delete
    requestDelete, confirmDeleteOpen, confirmDeleteTarget, handleConfirmDelete, handleCancelDelete,
    // move
    moveOpen, moveTarget, moveParent, setMoveParent, parentCandidates, requestMove, applyMove, cancelMove,
    // reorder
    reorderOpen, reorderTarget, reorderParentId, reorderIndex, setReorderIndex, requestReorder, applyReorder, closeReorder, reorderOptionsCount,
    // misc
    canCreateGroup, canCreateItem, actionLoadingId
  } as const;
}
