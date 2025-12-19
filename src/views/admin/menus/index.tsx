import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { IconDashboard, IconTypography, IconPalette, IconShadow, IconHelp, IconUsers, IconShield, IconLayoutSidebar, IconSettings, IconActivity, IconReport, IconPencil, IconTrash, IconArrowUp, IconArrowDown, IconArrowRight } from '@tabler/icons-react';
// import Divider from '@mui/material/Divider';
import MainCard from '#/ui-component/cards/MainCard';
import { http } from '#/services/apiClient/http';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';
import { getErrorMessage } from '#/utils/errorUtils';

// Top-level icon renderer for both forms and preview
function renderIconPreview(name: string): ReactElement | null {
  const common = { size: 18 } as const;
  switch (name) {
    case 'IconDashboard': return <IconDashboard {...common} />;
    case 'IconTypography': return <IconTypography {...common} />;
    case 'IconPalette': return <IconPalette {...common} />;
    case 'IconShadow': return <IconShadow {...common} />;
    case 'IconHelp': return <IconHelp {...common} />;
    case 'IconUsers': return <IconUsers {...common} />;
    case 'IconShield': return <IconShield {...common} />;
    case 'IconLayoutSidebar': return <IconLayoutSidebar {...common} />;
    case 'IconSettings': return <IconSettings {...common} />;
    case 'IconActivity': return <IconActivity {...common} />;
    case 'IconReport': return <IconReport {...common} />;
    default: return null;
  }
}

export default function AdminMenusPage() {
  const { token } = useAuth();

  // Left preview (tree)
  const [tree, setTree] = useState<MenuTreeNodeLocal[] | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [groupTitulo, setGroupTitulo] = useState('');
  const [groupIdKey, setGroupIdKey] = useState('');
  const [itemTitulo, setItemTitulo] = useState('');
  const [itemIdKey, setItemIdKey] = useState('');
  const [itemIdKeyId, setItemIdKeyId] = useState<number | ''>('');
  const [itemUrl, setItemUrl] = useState('/dashboard');
  const [itemIcon, setItemIcon] = useState<string>('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [tab, setTab] = useState(0);
  const [editingNode, setEditingNode] = useState<MenuTreeNodeLocal | null>(null);
  const isEditingGroup = editingNode?.tipo === 'group' || editingNode?.tipo === 'collapse';
  const isEditingItem = editingNode?.tipo === 'item';
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  // Confirm delete dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<MenuTreeNodeLocal | null>(null);
  // Move dialog state
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<MenuTreeNodeLocal | null>(null);
  const [moveParent, setMoveParent] = useState<number | ''>('');
  // Reorder dialog state
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderTarget, setReorderTarget] = useState<MenuTreeNodeLocal | null>(null);
  const [reorderParentId, setReorderParentId] = useState<number | null | undefined>(undefined);
  const [reorderIndex, setReorderIndex] = useState<number>(0);

  // Derive a map id_menu_item -> titulo from server tree for nicer labels in selects
  const tituloById = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    const walk = (nodes?: ReadonlyArray<MenuTreeNodeLocal>) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((n: MenuTreeNodeLocal) => {
        if (typeof n.id_menu_item === 'number' && typeof n.titulo === 'string') {
          map[n.id_menu_item] = n.titulo;
        }
        if (Array.isArray(n.children) && n.children.length) walk(n.children as ReadonlyArray<MenuTreeNodeLocal>);
      });
    };
    walk(tree ?? undefined);
    return map;
  }, [tree]);

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

  // id_key options from backend
  type IdKeyOption = { id_menu_item: number; id_key: string };
  const [idKeyOptions, setIdKeyOptions] = useState<IdKeyOption[]>([]);
  const fetchIdKeys = useCallback(async (): Promise<void> => {
    try {
      const data = await http<IdKeyOption[]>('/menus/select', { method: 'GET', token: token || undefined });
      const safe = Array.isArray(data) ? data.filter((o): o is IdKeyOption => !!o && typeof o.id_menu_item === 'number' && typeof o.id_key === 'string') : [];
      setIdKeyOptions(safe);
      // No preseleccionar: mantener Select en blanco hasta que el usuario elija
    } catch (e) {
      notify.error(getErrorMessage(e, 'No se pudo cargar opciones de id_key'));
    }
  }, [token]);


  const loadTree = useCallback(async (): Promise<void> => {
    setLoadingTree(true);
    setTreeError(null);
    try {
      const raw = await http<MenuTreeNodeLocal[]>('/menus/admin/tree', { method: 'GET', token: token || undefined });
      const data = isMenuTreeNodeArray(raw) ? raw : [];
      setTree(data);
    } catch {
      setTreeError('No se pudo cargar el árbol');
      setTree(null);
    } finally {
      setLoadingTree(false);
    }
  }, [token]);

  const startEdit = (node: MenuTreeNodeLocal) => {
    setEditingNode(node);
    if (node.tipo === 'item') {
      setTab(1);
      setItemTitulo(node.titulo);
      if (node.id_key) {
        const found = idKeyOptions.find((o) => o.id_key === node.id_key);
        setItemIdKey(node.id_key);
        setItemIdKeyId(found ? found.id_menu_item : '');
      } else {
        setItemIdKey('');
        setItemIdKeyId('');
      }
      setItemUrl(node.url ?? '');
      setItemIcon(node.icono ?? '');
      setParentId(typeof node.parent_id === 'number' ? node.parent_id : '');
    } else {
      setTab(0);
      setGroupTitulo(node.titulo);
      if (node.id_key) {
        setGroupIdKey(node.id_key);
      } else {
        setGroupIdKey('');
      }
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    // Opcional: restaurar valores por defecto de create
    setGroupTitulo('');
    setGroupIdKey('');
    setItemTitulo('');
    setItemIdKey('');
    setItemIdKeyId('');
    setItemUrl('');
    setItemIcon('');
    setParentId('');
  };

  const saveEditGroup = async () => {
    if (!editingNode) return;
    // Construir payload mínimo (solo campos cambiados)
    const payload: Record<string, unknown> = {};
    const nextTitulo = groupTitulo?.trim();
    if (typeof nextTitulo === 'string' && nextTitulo !== editingNode.titulo) {
      payload.titulo = nextTitulo;
    }
    // id_key está deshabilitado en edición; solo enviar si realmente cambió y tiene valor
    const nextIdKey = groupIdKey?.trim();
    if (nextIdKey && nextIdKey !== (editingNode.id_key ?? '')) {
      payload.id_key = nextIdKey;
    }
    if (Object.keys(payload).length === 0) {
      notify.info('No hay cambios para guardar');
      return;
    }
    setActionLoadingId(editingNode.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${editingNode.id_menu_item}`, {
        method: 'PUT',
        body: payload,
        token: token || undefined
      });
      notify.success('Grupo actualizado');
      cancelEdit();
      void loadTree();
    } catch {
      notify.error('No se pudo actualizar el grupo');
    } finally {
      setActionLoadingId(null);
    }
  };

  const saveEditItem = async () => {
    if (!editingNode) return;
    // Construir payload mínimo (solo campos cambiados).
    const payload: Record<string, unknown> = {};
    const nextTitulo = itemTitulo?.trim();
    if (typeof nextTitulo === 'string' && nextTitulo !== editingNode.titulo) {
      payload.titulo = nextTitulo;
    }
    const nextUrl = itemUrl?.trim();
    if (typeof nextUrl === 'string' && nextUrl !== (editingNode.url ?? '')) {
      payload.url = nextUrl;
    }
    const nextIcon = itemIcon?.trim();
    const currentIcon = (typeof editingNode.icono === 'string' ? editingNode.icono : '') ?? '';
    if ((nextIcon || '') !== currentIcon) {
      // Si está vacío, no enviar el campo para evitar sobreescribir con vacío salvo que realmente quieras limpiarlo.
      if (nextIcon) payload.icono = nextIcon;
    }
    // id_key en edición no se modifica desde UI; evitar enviar vacío.
    // Si en algún caso se habilita y cambia, solo enviar si difiere y tiene valor.
    const nextIdKey = itemIdKey?.trim();
    if (nextIdKey && nextIdKey !== (editingNode.id_key ?? '')) {
      payload.id_key = nextIdKey;
    }
    if (Object.keys(payload).length === 0) {
      notify.info('No hay cambios para guardar');
      return;
    }
    setActionLoadingId(editingNode.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${editingNode.id_menu_item}`, {
        method: 'PUT',
        body: payload,
        token: token || undefined
      });
      notify.success('Item actualizado');
      cancelEdit();
      void loadTree();
    } catch {
      notify.error('No se pudo actualizar el item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteNode = async (node: MenuTreeNodeLocal) => {
    setActionLoadingId(node.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${node.id_menu_item}`, { method: 'DELETE', token: token || undefined });
      notify.success('Eliminado');
      if (editingNode?.id_menu_item === node.id_menu_item) setEditingNode(null);
      void loadTree();
    } catch {
      notify.error('No se pudo eliminar');
    } finally {
      setActionLoadingId(null);
    }
  };

  const requestDelete = (node: MenuTreeNodeLocal) => {
    setConfirmDeleteTarget(node);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget) return;
    const target = confirmDeleteTarget;
    setConfirmDeleteOpen(false);
    setConfirmDeleteTarget(null);
    await deleteNode(target);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setConfirmDeleteTarget(null);
  };

  // moveNode fue reemplazado por diálogos; se mantiene requestMove

  const reorderNode = async (node: MenuTreeNodeLocal, parentId: number | null | undefined, newOrden: number | null) => {
    if (typeof parentId !== 'number' || newOrden === null) return;
    setActionLoadingId(node.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/edges`, {
        method: 'POST',
        body: { parent_id: parentId, child_id: node.id_menu_item, orden: newOrden },
        token: token || undefined
      });
      notify.success('Orden actualizado');
      void loadTree();
    } catch {
      notify.error('No se pudo reordenar');
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    void loadTree();
    void fetchIdKeys();
  }, [loadTree, fetchIdKeys]);

  const handleCreateGroup = async () => {
    try {
      const node = await http<{ titulo: string }>('/menus/admin/groups', { method: 'POST', body: { id_key: groupIdKey, titulo: groupTitulo, tipo: 'group' }, token: token || undefined });
      notify.success(`Grupo creado: ${node?.titulo ?? groupTitulo}`);
      // refrescar vista previa
      // limpiar solo el título para facilitar creación consecutiva
      setGroupTitulo('');
      void loadTree();
    } catch {
      notify.error('Error creando grupo');
    }
  };

  const handleCreateItem = async () => {
    try {
      const body = {
        id_key: itemIdKey,
        titulo: itemTitulo,
        tipo: 'item' as const,
        url: itemUrl,
        icono: itemIcon || undefined,
        parent_id: parentId === '' ? undefined : Number(parentId)
      };
      const node = await http<{ titulo: string }>('/menus/admin/items', { method: 'POST', body, token: token || undefined });
      notify.success(`Item creado: ${node?.titulo ?? itemTitulo}`);
      // refrescar vista previa
      // limpiar solo el título para facilitar creación consecutiva
      setItemTitulo('');
      void loadTree();
    } catch {
      notify.error('Error creando item');
    }
  };

  // Helpers: move/reorder dialogs logic
  const parentCandidates = useMemo(() => {
    const out: Array<{ id: number; label: string; disabled?: boolean }> = [];
    const walk = (nodes?: ReadonlyArray<MenuTreeNodeLocal>) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((n: MenuTreeNodeLocal) => {
        if (n.tipo !== 'item') {
          out.push({ id: n.id_menu_item, label: `${n.titulo} (${n.tipo})` });
        }
        if (Array.isArray(n.children) && n.children.length) walk(n.children);
      });
    };
    walk(tree ?? undefined);
    return out;
  }, [tree]);

  function requestMove(node: MenuTreeNodeLocal) {
    setMoveTarget(node);
    setMoveParent(typeof node.parent_id === 'number' ? node.parent_id : '');
    setMoveOpen(true);
  }

  const applyMove = async () => {
    if (!moveTarget) return;
    const newParent = moveParent === '' ? undefined : Number(moveParent);
    const node = moveTarget;
    setMoveOpen(false);
    setActionLoadingId(node.id_menu_item);
    try {
      if (typeof node.parent_id === 'number') {
        await http<unknown>(`/menus/admin/edges`, {
          method: 'DELETE',
          body: { parent_id: node.parent_id, child_id: node.id_menu_item },
          token: token || undefined
        }).catch(() => undefined);
      }
      if (typeof newParent === 'number') {
        await http<unknown>(`/menus/admin/edges`, {
          method: 'POST',
          body: { parent_id: newParent, child_id: node.id_menu_item },
          token: token || undefined
        });
      }
      notify.success('Nodo movido');
      void loadTree();
    } catch {
      notify.error('No se pudo mover el nodo');
    } finally {
      setActionLoadingId(null);
      setMoveTarget(null);
    }
  };

  function cancelMove() {
    setMoveOpen(false);
    setMoveTarget(null);
  }

  function getSiblings(parentId: number | null | undefined): MenuTreeNodeLocal[] {
    if (!Array.isArray(tree)) return [];
    if (typeof parentId !== 'number') return tree;
    const stack: MenuTreeNodeLocal[] = [...tree];
    while (stack.length) {
      const n = stack.shift();
      if (!n) break;
      if (n.id_menu_item === parentId) return n.children ?? [];
      if (Array.isArray(n.children)) stack.push(...n.children);
    }
    return [];
  }

  function requestReorder(node: MenuTreeNodeLocal, parentId: number | null | undefined) {
    const siblings = getSiblings(parentId);
    const currentIndex = siblings.findIndex((s) => s.id_menu_item === node.id_menu_item);
    setReorderTarget(node);
    setReorderParentId(parentId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const maxIndex = Math.max(siblings.length - 1, 0);
    setReorderIndex(Math.min(safeIndex, maxIndex));
    setReorderOpen(true);
  }

  const applyReorder = async () => {
    if (!reorderTarget) return;
    const node = reorderTarget;
    const pid = reorderParentId;
    const siblings = getSiblings(pid);
    const maxIndex = Math.max(siblings.length - 1, 0);
    const idx = Math.min(Math.max(0, reorderIndex), maxIndex);
    setReorderOpen(false);
    await reorderNode(node, pid, idx);
    setReorderTarget(null);
  };

  return (
    <>
    <Grid container spacing={2} alignItems="stretch">
      {/* Left: Preview tree */}
      <Grid size={{ xs: 12, md: 5 }}>
        <MainCard title="Vista previa del menú" sx={{ height: '100%' }}>
          <Stack sx={{ gap: 1 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {loadingTree ? 'Cargando…' : treeError ? treeError : 'Árbol generado por el servidor'}
              </Typography>
              <Button size="small" onClick={() => { void loadTree(); }}>Refrescar</Button>
            </Stack>
            <Divider />
            <List dense>
              {Array.isArray(tree) && tree.length > 0 ? (
                renderTree(tree, 0, undefined, {
                  onEdit: (n) => startEdit(n),
                  onDelete: (n) => { requestDelete(n); },
                  onMove: (n) => { requestMove(n); },
                  onReorder: (n, p) => { requestReorder(n, p); }
                })
              ) : (
                <ListItem>
                  <ListItemText primary={loadingTree ? 'Cargando…' : 'Sin datos'} />
                </ListItem>
              )}
            </List>
          </Stack>
        </MainCard>
      </Grid>

      {/* Right: Tabs for Groups/Items */}
      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Administración de menús" sx={{ height: '100%' }}>
          <Stack sx={{ height: '100%' }}>
            <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
              <Tab label="Grupos" />
              <Tab label="Items" />
            </Tabs>
            <Divider />
            {/* Tab panels */}
            {tab === 0 && (
              <Stack sx={{ p: 2, gap: 2 }}>
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    label="id_key"
                    placeholder={isEditingGroup ? undefined : 'nuevo id_key'}
                    value={isEditingGroup ? (editingNode?.id_key ?? '') : groupIdKey}
                    onChange={(e) => setGroupIdKey(e.target.value)}
                    size="small"
                    disabled={isEditingGroup}
                  />
                  <TextField label="título" placeholder="Ingrese título" value={groupTitulo} onChange={(e) => setGroupTitulo(e.target.value)} size="small" />
                </Stack>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <Button
                    variant="contained"
                    disabled={isEditingGroup}
                    onClick={() => { void handleCreateGroup(); }}
                  >
                    Crear Grupo
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={!isEditingGroup || actionLoadingId !== null}
                    onClick={() => { void saveEditGroup(); }}
                  >
                    Guardar cambios
                  </Button>
                  {isEditingGroup && (
                    <Button onClick={cancelEdit}>Cancelar</Button>
                  )}
                </Stack>
              </Stack>
            )}
            {tab === 1 && (
              <Stack sx={{ p: 2, gap: 2 }}>
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                  {isEditingItem ? (
                    <TextField
                      label="id_key"
                      value={editingNode?.id_key ?? itemIdKey}
                      size="small"
                      disabled
                    />
                  ) : (
                    <Select
                      size="small"
                      value={itemIdKeyId}
                      displayEmpty
                      onChange={(e) => {
                        const valRaw = String(e.target.value);
                        if (valRaw === '') {
                          setItemIdKeyId('');
                          setItemIdKey('');
                          setItemTitulo('');
                          return;
                        }
                        const selected = idKeyOptions.find((o) => o.id_menu_item === Number(valRaw));
                        setItemIdKeyId(Number(valRaw));
                        setItemIdKey(selected ? selected.id_key : '');
                        const id = Number(valRaw);
                        const titulo = tituloById[id] ?? (selected ? selected.id_key : '');
                        setItemTitulo(titulo ?? '');
                      }}
                      sx={{ minWidth: 220 }}
                      renderValue={(v) => {
                        const vs = String(v ?? '');
                        if (vs === '') return <em>Seleccione id_key</em>;
                        const id = Number(vs);
                        const opt = idKeyOptions.find((o) => o.id_menu_item === id);
                        if (!opt) return <em>Seleccione id_key</em>;
                        return tituloById[id] ?? opt.id_key;
                      }}
                    >
                      <MenuItem value="">
                        <em>Seleccione id_key</em>
                      </MenuItem>
                      {idKeyOptions.map((opt) => (
                        <MenuItem key={opt.id_menu_item} value={opt.id_menu_item}>
                          {tituloById[opt.id_menu_item] ?? opt.id_key}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                  <TextField label="título" placeholder="Ingrese título" value={itemTitulo} onChange={(e) => setItemTitulo(e.target.value)} size="small" />
                  <TextField label="url" placeholder="/ruta" value={itemUrl} onChange={(e) => setItemUrl(e.target.value)} size="small" />
                  <Select
                    displayEmpty
                    value={itemIcon}
                    onChange={(e) => setItemIcon(String(e.target.value))}
                    size="small"
                    sx={{ minWidth: 220 }}
                    renderValue={(value) => (
                      value ? (
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                          {renderIconPreview(String(value))}
                          <span>{String(value)}</span>
                        </Stack>
                      ) : (
                        <em>Sin icono</em>
                      )
                    )}
                  >
                    <MenuItem value="">
                      <em>Sin icono</em>
                    </MenuItem>
                    {ICON_OPTIONS.filter((v) => v !== '').map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                          {renderIconPreview(opt)}
                          <span>{opt}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField label="parent_id (opcional)" value={parentId} onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))} size="small" />
                </Stack>
                <Stack direction="row" sx={{ gap: 1 }}>
                  {isEditingItem ? (
                    <>
                      <Button disabled={actionLoadingId !== null} variant="contained" onClick={() => { void saveEditItem(); }}>Guardar cambios</Button>
                      <Button onClick={cancelEdit}>Cancelar</Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      disabled={(itemIdKey.trim() === '' || itemTitulo.trim() === '')}
                      onClick={() => { void handleCreateItem(); }}
                    >
                      Crear Item
                    </Button>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
    {/* Confirm Delete Dialog */}
    <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {confirmDeleteTarget ? `¿Desea eliminar "${confirmDeleteTarget.titulo}" (${confirmDeleteTarget.tipo})?` : '¿Desea eliminar este elemento?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelDelete}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={() => { void handleConfirmDelete(); }} autoFocus>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>

    {/* Move Dialog */}
    <Dialog open={moveOpen} onClose={cancelMove} maxWidth="sm" fullWidth>
      <DialogTitle>Mover nodo</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {moveTarget ? `Selecciona el nuevo parent para "${moveTarget.titulo}"` : 'Selecciona el nuevo parent'}
        </DialogContentText>
        <Stack sx={{ gap: 2 }}>
          <FormControl size="small">
            <InputLabel id="move-parent-label">Parent</InputLabel>
            <Select
              labelId="move-parent-label"
              label="Parent"
              value={moveParent}
              onChange={(e) => {
                const raw = String(e.target.value);
                setMoveParent(raw === '' ? '' : Number(raw));
              }}
            >
              <MenuItem value="">
                <em>Raíz (sin parent)</em>
              </MenuItem>
              {parentCandidates
                .filter((opt) => opt.id !== (moveTarget?.id_menu_item ?? -1))
                .map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelMove}>Cancelar</Button>
        <Button variant="contained" onClick={() => { void applyMove(); }}>Mover</Button>
      </DialogActions>
    </Dialog>

    {/* Reorder Dialog */}
    <Dialog open={reorderOpen} onClose={() => setReorderOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Reordenar nodo</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {reorderTarget ? `Nueva posición para "${reorderTarget.titulo}"` : 'Selecciona la posición'}
        </DialogContentText>
        <Stack sx={{ gap: 2 }}>
          {(() => {
            const siblings = getSiblings(reorderParentId);
            const options = Array.from({ length: Math.max(siblings.length, 1) }, (_, i) => i);
            return (
              <FormControl size="small">
                <InputLabel id="reorder-index-label">Posición</InputLabel>
                <Select
                  labelId="reorder-index-label"
                  label="Posición"
                  value={reorderIndex}
                  onChange={(e) => setReorderIndex(Number(e.target.value))}
                >
                  {options.map((i) => (
                    <MenuItem key={i} value={i}>{i === 0 ? '0 (primero)' : i}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          })()}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReorderOpen(false)}>Cancelar</Button>
        <Button variant="contained" onClick={() => { void applyReorder(); }}>Aplicar</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

// Helpers
// Local types for tree preview
interface MenuTreeNodeLocal {
  id_menu_item: number;
  id_key?: string;
  titulo: string;
  tipo: 'group' | 'collapse' | 'item';
  icono?: string | null;
  url?: string | null;
  parent_id?: number | null;
  orden?: number | null;
  children?: MenuTreeNodeLocal[];
}

function isMenuTreeNode(val: unknown): val is MenuTreeNodeLocal {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return 'id_menu_item' in obj && 'titulo' in obj && 'tipo' in obj;
}

function isMenuTreeNodeArray(val: unknown): val is MenuTreeNodeLocal[] {
  return Array.isArray(val) && val.every((n) => isMenuTreeNode(n));
}

type TreeHandlers = {
  onEdit: (node: MenuTreeNodeLocal) => void;
  onDelete: (node: MenuTreeNodeLocal) => Promise<void> | void;
  onMove: (node: MenuTreeNodeLocal) => Promise<void> | void;
  onReorder: (node: MenuTreeNodeLocal, parentId: number | null | undefined, newOrden: number | null) => Promise<void> | void;
};

function renderTree(
  nodes: ReadonlyArray<MenuTreeNodeLocal>,
  depth = 0,
  parentId?: number | null,
  h?: TreeHandlers
): ReactElement[] {
  const items: ReactElement[] = [];
  nodes.forEach((node, index) => {
    if (!isMenuTreeNode(node)) return;
    const canReorder = typeof parentId === 'number';
    const isFirst = index === 0;
    const isLast = index === nodes.length - 1;
    items.push(
      <ListItem key={node.id_menu_item} sx={{ pl: 1 + depth * 2 }}>
        <ListItemText
          primary={
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              {/* icon preview: only for items and not NULL */}
              {(() => {
                const iconName = typeof node.icono === 'string' ? node.icono.trim() : '';
                if (!iconName || iconName.toUpperCase() === 'NULL' || node.tipo !== 'item') return null;
                return renderIconPreview(iconName);
              })()}
              <Typography variant="body2" color={node.tipo === 'item' ? 'text.secondary' : undefined}>{node.titulo}</Typography>
              <Typography variant="caption" color="text.secondary">({node.tipo})</Typography>
              <Stack direction="row" sx={{ ml: 'auto' }}>
                <IconButton size="small" onClick={() => h?.onEdit(node)}>
                  <IconPencil size={16} />
                </IconButton>
                <IconButton size="small" onClick={() => { void h?.onDelete(node); }}>
                  <IconTrash size={16} />
                </IconButton>
                <IconButton size="small" onClick={() => { void h?.onMove(node); }}>
                  <IconArrowRight size={16} />
                </IconButton>
                <IconButton size="small" disabled={!canReorder || isFirst} onClick={() => { void h?.onReorder(node, parentId, (node.orden ?? index) - 1); }}>
                  <IconArrowUp size={16} />
                </IconButton>
                <IconButton size="small" disabled={!canReorder || isLast} onClick={() => { void h?.onReorder(node, parentId, (node.orden ?? index) + 1); }}>
                  <IconArrowDown size={16} />
                </IconButton>
              </Stack>
            </Stack>
          }
        />
      </ListItem>
    );
    if (Array.isArray(node.children) && node.children.length > 0) {
      items.push(...renderTree(node.children, depth + 1, node.id_menu_item, h));
    }
  });
  return items;
}
