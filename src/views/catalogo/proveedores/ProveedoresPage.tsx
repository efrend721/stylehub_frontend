import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { IconPlus } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import { ProveedoresTable } from './ProveedoresTable';
import { ProveedoresDeleteDialog } from './ProveedoresDeleteDialog';
import { ProveedoresEditDialog } from './ProveedoresEditDialog';
import { ProveedoresCreateDialog } from './ProveedoresCreateDialog';
import { useProveedores } from './useProveedores';
import type { GridRowSelectionModel } from '@mui/x-data-grid';

export default function ProveedoresPage() {
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
    createProveedor,
    creating,
    fetchProveedores,
    createFieldErrors,
    editFieldErrors
  } = useProveedores();

  return (
    <MainCard
      title="Gestión de Proveedores"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={openCreateDialog} startIcon={<IconPlus size="18" />}>
            Agregar Proveedor
          </Button>
          <Button onClick={() => void fetchProveedores()} disabled={loading}>
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
          <Typography>No hay proveedores.</Typography>
        </Box>
      ) : (
        <ProveedoresTable
          rows={rows}
          selectedIds={selectedIds}
          deleting={deleting}
          selectionModel={selectionModel}
          onSelectionModelChange={(m: GridRowSelectionModel) => setSelectionModel(m)}
          onAskDelete={openConfirmFor}
          onEdit={openEditFor}
        />
      )}

      <ProveedoresDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <ProveedoresEditDialog
        item={editItem}
        saving={saving}
        onClose={() => setEditItem(null)}
        onChange={(item) => setEditItem(item)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <ProveedoresCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(payload) => void createProveedor(payload)}
        fieldErrors={createFieldErrors}
      />
    </MainCard>
  );
}
