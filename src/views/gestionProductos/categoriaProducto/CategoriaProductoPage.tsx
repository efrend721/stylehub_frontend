import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MainCard from '#/ui-component/cards/MainCard';
import { CategoriasProductoList } from './CategoriasProductoList';
import { CategoriasProductoDeleteDialog } from './CategoriasProductoDeleteDialog';
import { CategoriasProductoEditDialog } from './CategoriasProductoEditDialog';
import { CategoriasProductoCreateDialog } from './CategoriasProductoCreateDialog';
import { useCategoriaProducto } from './useCategoriaProducto';
import CategoriaProductoHeaderCard from './CategoriaProductoHeaderCard';

export default function CategoriaProductoPage() {
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
    createCategoria,
    creating,
    createFieldErrors,
    editFieldErrors
  } = useCategoriaProducto();

  return (
    <>
      <CategoriaProductoHeaderCard downSm={downSm} onAdd={openCreateDialog} />

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
            <Typography>No hay categorías de producto.</Typography>
          </Box>
        ) : (
          <CategoriasProductoList items={rows} onEdit={openEditFor} onAskDelete={(id) => openConfirmFor([id])} />
        )}
      </MainCard>

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
    </>
  );
}
