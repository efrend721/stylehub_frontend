import Grid from '@mui/material/Grid';
import { TreeView, AdminPanel, DeleteDialog, MoveDialog, ReorderDialog } from './components';
import { useMenuAdmin } from './hooks/useMenuAdmin';

export default function AdminMenusPage() {
  const ctx = useMenuAdmin();

  return (
    <>
      <Grid container spacing={2} alignItems="stretch">
        <TreeView
          tree={ctx.tree}
          loading={ctx.loadingTree}
          error={ctx.treeError}
          onRefresh={() => { void ctx.loadTree(); }}
          handlers={{
            onEdit: (n) => ctx.startEdit(n),
            onDelete: (n) => ctx.requestDelete(n),
            onMove: (n) => ctx.requestMove(n),
            onReorder: (n, p) => { ctx.requestReorder(n, p); }
          }}
        />

        <AdminPanel
          creationType={ctx.creationType}
          setCreationType={ctx.setCreationType}
          isEditingGroup={ctx.isEditingGroup}
          isEditingItem={ctx.isEditingItem}
          actionLoadingId={ctx.actionLoadingId}
          // group
          groupIdKey={ctx.groupIdKey}
          setGroupIdKey={ctx.setGroupIdKey}
          groupTitulo={ctx.groupTitulo}
          setGroupTitulo={ctx.setGroupTitulo}
          canCreateGroup={ctx.canCreateGroup}
          onCreateGroup={() => { void ctx.handleCreateGroup(); }}
          onSaveGroup={() => { void ctx.saveEditGroup(); }}
          onCancel={ctx.isEditingGroup || ctx.isEditingItem ? ctx.cancelEdit : ctx.resetCreateUI}
          // item
          idKeyOptions={ctx.idKeyOptions}
          tituloById={ctx.tituloById}
          parentId={ctx.parentId}
          setParentId={ctx.setParentId}
          itemIdKey={ctx.itemIdKey}
          setItemIdKey={ctx.setItemIdKey}
          itemTitulo={ctx.itemTitulo}
          setItemTitulo={ctx.setItemTitulo}
          itemIcon={ctx.itemIcon}
          setItemIcon={ctx.setItemIcon}
          ICON_OPTIONS={ctx.ICON_OPTIONS}
          itemUrl={ctx.isEditingItem
            ? ((ctx.editingNode?.url && ctx.editingNode.url.trim() !== '')
              ? String(ctx.editingNode.url)
              : (() => {
                const effParentId = (typeof ctx.editingNode?.parent_id === 'number') ? ctx.editingNode.parent_id : (typeof ctx.parentId === 'number' ? ctx.parentId : null);
                const opt = (typeof effParentId === 'number') ? ctx.idKeyOptions.find((o) => o.id_menu_item === effParentId) : undefined;
                const groupKey = (opt?.id_key ?? '').trim();
                const itemKey = (ctx.editingNode?.id_key ?? '').trim();
                return groupKey ? (itemKey ? `/${groupKey}/${itemKey}` : `/${groupKey}`) : '';
              })())
            : ctx.itemUrl}
          canCreateItem={ctx.canCreateItem}
          onCreateItem={() => { void ctx.handleCreateItem(); }}
          onSaveItem={() => { void ctx.saveEditItem(); }}
          editingNodeIdKey={ctx.editingNode?.id_key}
          editingNodeParentId={ctx.editingNode?.parent_id}
        />
      </Grid>

      <DeleteDialog
        open={ctx.confirmDeleteOpen}
        target={ctx.confirmDeleteTarget}
        onCancel={ctx.handleCancelDelete}
        onConfirm={() => { void ctx.handleConfirmDelete(); }}
      />

      <MoveDialog
        open={ctx.moveOpen}
        target={ctx.moveTarget}
        parentCandidates={ctx.parentCandidates}
        value={ctx.moveParent}
        onChange={ctx.setMoveParent}
        onCancel={ctx.cancelMove}
        onApply={() => { void ctx.applyMove(); }}
      />

      <ReorderDialog
        open={ctx.reorderOpen}
        target={ctx.reorderTarget}
        optionsCount={ctx.reorderOptionsCount}
        value={ctx.reorderIndex}
        onChange={ctx.setReorderIndex}
        onCancel={ctx.closeReorder}
        onApply={() => { void ctx.applyReorder(); }}
      />
    </>
  );
}
