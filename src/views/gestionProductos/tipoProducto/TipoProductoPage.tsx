import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MainCard from '#/ui-component/cards/MainCard';
import { TiposProductoList } from './TiposProductoList';
import { TiposProductoDeleteDialog } from './TiposProductoDeleteDialog';
import { TiposProductoEditDialog } from './TiposProductoEditDialog';
import { TiposProductoCreateDialog } from './TiposProductoCreateDialog';
import { useTiposProducto } from './useTiposProducto';
import TipoProductoHeaderCard from './TipoProductoHeaderCard';

export default function TipoProductoPage() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    rows,
    loading,
    error,
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
    createFieldErrors,
    editFieldErrors
  } = useTiposProducto();

  return (
    <>
      <TipoProductoHeaderCard downSm={downSm} onAdd={openCreateDialog} />

      <MainCard sx={{ mt: 0.5 }}>
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
          <TiposProductoList items={rows} onEdit={openEditFor} onAskDelete={(id) => openConfirmFor([id])} />
        )}
      </MainCard>

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
    </>
  );
}
