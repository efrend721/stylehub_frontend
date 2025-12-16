import { useCallback, useEffect, useState, type ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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

  const [groupTitulo, setGroupTitulo] = useState('Gestión');
  const [groupIdKey, setGroupIdKey] = useState('gestion');
  const [itemTitulo, setItemTitulo] = useState('Dashboard');
  const [itemIdKey, setItemIdKey] = useState('dashboard');
  const [itemUrl, setItemUrl] = useState('/dashboard');
  const [itemIcon, setItemIcon] = useState<string>('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [tab, setTab] = useState(0);
  const [editingNode, setEditingNode] = useState<MenuTreeNodeLocal | null>(null);
  const isEditingGroup = editingNode?.tipo === 'group' || editingNode?.tipo === 'collapse';
  const isEditingItem = editingNode?.tipo === 'item';
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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
      setItemIdKey(node.id_key ?? '');
      setItemUrl(node.url ?? '');
      setItemIcon(node.icono ?? '');
      setParentId(typeof node.parent_id === 'number' ? node.parent_id : '');
    } else {
      setTab(0);
      setGroupTitulo(node.titulo);
      setGroupIdKey(node.id_key ?? '');
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    // Opcional: restaurar valores por defecto de create
    setGroupTitulo('Gestión');
    setGroupIdKey('gestion');
    setItemTitulo('Dashboard');
    setItemIdKey('dashboard');
    setItemUrl('/dashboard');
    setItemIcon('');
    setParentId('');
  };

  const saveEditGroup = async () => {
    if (!editingNode) return;
    setActionLoadingId(editingNode.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${editingNode.id_menu_item}`, {
        method: 'PUT',
        body: { titulo: groupTitulo, id_key: groupIdKey },
        token: token || undefined
      });
      notify.success('Grupo actualizado');
      setEditingNode(null);
      void loadTree();
    } catch {
      notify.error('No se pudo actualizar el grupo');
    } finally {
      setActionLoadingId(null);
    }
  };

  const saveEditItem = async () => {
    if (!editingNode) return;
    setActionLoadingId(editingNode.id_menu_item);
    try {
      await http<unknown>(`/menus/admin/${editingNode.id_menu_item}`, {
        method: 'PUT',
        body: { titulo: itemTitulo, id_key: itemIdKey, url: itemUrl, icono: itemIcon || undefined },
        token: token || undefined
      });
      notify.success('Item actualizado');
      setEditingNode(null);
      void loadTree();
    } catch {
      notify.error('No se pudo actualizar el item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteNode = async (node: MenuTreeNodeLocal) => {
    const ok = window.confirm(`¿Eliminar "${node.titulo}"?`);
    if (!ok) return;
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

  const moveNode = async (node: MenuTreeNodeLocal) => {
    const value = window.prompt('Nuevo parent_id (vacío para raíz)', node.parent_id ? String(node.parent_id) : '');
    if (value === null) return;
    const newParent = value.trim() === '' ? undefined : Number(value);
    setActionLoadingId(node.id_menu_item);
    try {
      // Quitar relación anterior si existe
      if (typeof node.parent_id === 'number') {
        await http<unknown>(`/menus/admin/edges`, {
          method: 'DELETE',
          body: { parent_id: node.parent_id, child_id: node.id_menu_item },
          token: token || undefined
        }).catch(() => undefined);
      }
      // Agregar nueva relación si se especificó parent
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
    }
  };

  const reorderNode = async (node: MenuTreeNodeLocal, parentId: number | null | undefined, newOrden: number | null) => {
    if (typeof parentId !== 'number' || newOrden === null) return;
    setActionLoadingId(node.id_menu_item);
    try {
      // Usamos POST como upsert con orden (ajústese a PUT si backend lo requiere)
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
  }, [loadTree]);

  const handleCreateGroup = async () => {
    try {
      const node = await http<{ titulo: string }>('/menus/admin/groups', { method: 'POST', body: { id_key: groupIdKey, titulo: groupTitulo, tipo: 'group' }, token: token || undefined });
      notify.success(`Grupo creado: ${node?.titulo ?? groupTitulo}`);
      // refrescar vista previa
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
      void loadTree();
    } catch {
      notify.error('Error creando item');
    }
  };

  return (
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
                  onDelete: (n) => { void deleteNode(n); },
                  onMove: (n) => { void moveNode(n); },
                  onReorder: (n, p, o) => { void reorderNode(n, p, o); }
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
                  <TextField label="id_key" value={groupIdKey} onChange={(e) => setGroupIdKey(e.target.value)} size="small" />
                  <TextField label="título" value={groupTitulo} onChange={(e) => setGroupTitulo(e.target.value)} size="small" />
                </Stack>
                <Stack direction="row" sx={{ gap: 1 }}>
                  {isEditingGroup ? (
                    <>
                      <Button disabled={actionLoadingId !== null} variant="contained" onClick={() => { void saveEditGroup(); }}>Guardar cambios</Button>
                      <Button onClick={cancelEdit}>Cancelar</Button>
                    </>
                  ) : (
                    <Button variant="contained" onClick={() => { void handleCreateGroup(); }}>Crear Grupo</Button>
                  )}
                </Stack>
              </Stack>
            )}
            {tab === 1 && (
              <Stack sx={{ p: 2, gap: 2 }}>
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                  <TextField label="id_key" value={itemIdKey} onChange={(e) => setItemIdKey(e.target.value)} size="small" />
                  <TextField label="título" value={itemTitulo} onChange={(e) => setItemTitulo(e.target.value)} size="small" />
                  <TextField label="url" value={itemUrl} onChange={(e) => setItemUrl(e.target.value)} size="small" />
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
                    <Button variant="contained" onClick={() => { void handleCreateItem(); }}>Crear Item</Button>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
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
