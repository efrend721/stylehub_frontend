import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { IconPlus } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import { CategoriasProductoTable } from './CategoriasProductoTable';
import { CategoriasProductoDeleteDialog } from './CategoriasProductoDeleteDialog';
import { CategoriasProductoEditDialog } from './CategoriasProductoEditDialog';
import { CategoriasProductoCreateDialog } from './CategoriasProductoCreateDialog';
import { useCategoriaProducto } from './useCategoriaProducto';
import type { GridRowSelectionModel } from '@mui/x-data-grid';

export default function CategoriaProductoPage() {
  const {
    rows,
    loading,
    error,
    selectionModel,
    setSelectionModel,
    selectedIds,
    confirmOpen,
    setConfirmOpen,
    deleteIds,
    openConfirmFor,
    doBulkDelete,
    deleting,
    editItem,
    setEditItem,
    openEditFor,
    saveEdit,
    saving,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createCategoria,
    creating,
    fetchCategorias,
    createFieldErrors,
    editFieldErrors
  } = useCategoriaProducto();

  return (
    <MainCard
      title="Gestión de Categorías de Producto"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={openCreateDialog} startIcon={<IconPlus size="18" />}>
            Agregar Categoría
          </Button>
          <Button onClick={() => void fetchCategorias()} disabled={loading}>
            Refrescar
          </Button>
        </Box>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography>No hay categorías de producto.</Typography>
        </Box>
      ) : (
        <CategoriasProductoTable
          rows={rows}
          selectedIds={selectedIds}
          deleting={deleting}
          selectionModel={selectionModel}
          onSelectionModelChange={(m: GridRowSelectionModel) => setSelectionModel(m)}
          onAskDelete={openConfirmFor}
          onEdit={openEditFor}
        />
      )}

      <CategoriasProductoDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <CategoriasProductoEditDialog
        item={editItem}
        saving={saving}
        onClose={() => setEditItem(null)}
        onChange={(item) => setEditItem(item)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <CategoriasProductoCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(payload) => void createCategoria(payload)}
        fieldErrors={createFieldErrors}
      />
    </MainCard>
  );
}
