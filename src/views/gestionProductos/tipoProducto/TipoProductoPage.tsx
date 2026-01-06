import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import { TiposProductoTable } from './TiposProductoTable';
import { TiposProductoDeleteDialog } from './TiposProductoDeleteDialog';
import { TiposProductoEditDialog } from './TiposProductoEditDialog';
import { TiposProductoCreateDialog } from './TiposProductoCreateDialog';
import { useTiposProducto } from './useTiposProducto';
import type { GridRowSelectionModel } from '@mui/x-data-grid';

export default function TipoProductoPage() {
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
    createTipo,
    creating,
    fetchTipos,
    createFieldErrors,
    editFieldErrors
  } = useTiposProducto();

  return (
    <MainCard
      title="Gestión de Tipos de Producto"
      secondary={
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Refrescar">
            <span>
              <IconButton onClick={() => void fetchTipos()} disabled={loading} color="secondary">
                <IconRefresh size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Button variant="contained" onClick={openCreateDialog} startIcon={<IconPlus size="18" />}>
            Agregar Tipo
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
          <Typography>No hay tipos de producto.</Typography>
        </Box>
      ) : (
        <TiposProductoTable
          rows={rows}
          selectedIds={selectedIds}
          deleting={deleting}
          selectionModel={selectionModel}
          onSelectionModelChange={(m: GridRowSelectionModel) => setSelectionModel(m)}
          onAskDelete={openConfirmFor}
          onEdit={openEditFor}
        />
      )}

      <TiposProductoDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <TiposProductoEditDialog
        item={editItem}
        saving={saving}
        onClose={() => setEditItem(null)}
        onChange={(item) => setEditItem(item)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <TiposProductoCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(payload) => void createTipo(payload)}
        fieldErrors={createFieldErrors}
      />
    </MainCard>
  );
}
