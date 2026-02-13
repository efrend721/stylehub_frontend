import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MainCard from '#/ui-component/cards/MainCard';
import { CategoriasArticuloList } from './CategoriasArticuloList';
import { CategoriasArticuloDeleteDialog } from './CategoriasArticuloDeleteDialog';
import { CategoriasArticuloEditDialog } from './CategoriasArticuloEditDialog';
import { CategoriasArticuloCreateDialog } from './CategoriasArticuloCreateDialog';
import { useCategoriaArticulo } from './useCategoriaArticulo';
import CategoriaArticuloHeaderCard from './CategoriaArticuloHeaderCard';

export default function CategoriaArticuloPage() {
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
  } = useCategoriaArticulo();

  return (
    <>
      <CategoriaArticuloHeaderCard downSm={downSm} onAdd={openCreateDialog} />

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
            <Typography>No hay categorías de artículo.</Typography>
          </Box>
        ) : (
          <CategoriasArticuloList items={rows} onEdit={openEditFor} onAskDelete={(id) => openConfirmFor([id])} />
        )}
      </MainCard>

      <CategoriasArticuloDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <CategoriasArticuloEditDialog
        item={editItem}
        saving={saving}
        onClose={() => setEditItem(null)}
        onChange={(item) => setEditItem(item)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <CategoriasArticuloCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(payload) => void createCategoria(payload)}
        fieldErrors={createFieldErrors}
      />
    </>
  );
}
