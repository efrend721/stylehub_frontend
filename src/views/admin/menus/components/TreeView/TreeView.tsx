import { type ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { IconPencil, IconTrash, IconArrowRight, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import { renderIconPreview } from '#/views/admin/menus/utils';
import { type MenuTreeNodeLocal } from '#/views/admin/menus/types';

export type TreeHandlers = {
  onEdit: (node: MenuTreeNodeLocal) => void;
  onDelete: (node: MenuTreeNodeLocal) => void;
  onMove: (node: MenuTreeNodeLocal) => void;
  onReorder: (node: MenuTreeNodeLocal, parentId: number | null | undefined, newOrden: number | null) => void;
};

function renderTree(
  nodes: ReadonlyArray<MenuTreeNodeLocal>,
  depth = 0,
  parentId?: number | null,
  h?: TreeHandlers
): ReactElement[] {
  const items: ReactElement[] = [];
  nodes.forEach((node, index) => {
    const canReorder = typeof parentId === 'number';
    const isFirst = index === 0;
    const isLast = index === nodes.length - 1;
    items.push(
      <ListItem key={node.id_menu_item} sx={{ pl: 1 + depth * 2 }}>
        <ListItemText
          primary={
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
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
                <IconButton size="small" onClick={() => h?.onDelete(node)}>
                  <IconTrash size={16} />
                </IconButton>
                <IconButton size="small" onClick={() => h?.onMove(node)}>
                  <IconArrowRight size={16} />
                </IconButton>
                <IconButton size="small" disabled={!canReorder || isFirst} onClick={() => {
                  const newOrderOne = index; // 1-based
                  h?.onReorder(node, parentId, newOrderOne);
                }}>
                  <IconArrowUp size={16} />
                </IconButton>
                <IconButton size="small" disabled={!canReorder || isLast} onClick={() => {
                  const newOrderOne = index + 2; // 1-based
                  h?.onReorder(node, parentId, newOrderOne);
                }}>
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

export function TreeView(props: {
  tree: ReadonlyArray<MenuTreeNodeLocal> | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  handlers: TreeHandlers;
}) {
  const { tree, loading, error, onRefresh, handlers } = props;
  return (
    <Grid size={{ xs: 12, md: 5 }}>
      <MainCard title="Vista previa del menú" sx={{ height: '100%' }}>
        <Stack sx={{ gap: 1 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Cargando…' : error ? error : 'Árbol generado por el servidor'}
            </Typography>
            <Button size="small" onClick={onRefresh}>Refrescar</Button>
          </Stack>
          <Divider />
          <List dense>
            {Array.isArray(tree) && tree.length > 0 ? (
              renderTree(tree, 0, undefined, handlers)
            ) : (
              <ListItem>
                <ListItemText primary={loading ? 'Cargando…' : 'Sin datos'} />
              </ListItem>
            )}
          </List>
        </Stack>
      </MainCard>
    </Grid>
  );
}
