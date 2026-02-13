import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MainCard from '#/ui-component/cards/MainCard';
import { TiposArticuloList } from './TiposArticuloList';
import { TiposArticuloDeleteDialog } from './TiposArticuloDeleteDialog';
import { TiposArticuloEditDialog } from './TiposArticuloEditDialog';
import { TiposArticuloCreateDialog } from './TiposArticuloCreateDialog';
import { useTiposArticulo } from './useTiposArticulo';
import TipoArticuloHeaderCard from './TipoArticuloHeaderCard';

export default function TipoArticuloPage() {
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
  } = useTiposArticulo();

  return (
    <>
      <TipoArticuloHeaderCard downSm={downSm} onAdd={openCreateDialog} />

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
            <Typography>No hay tipos de artículo.</Typography>
          </Box>
        ) : (
          <TiposArticuloList items={rows} onEdit={openEditFor} onAskDelete={(id) => openConfirmFor([id])} />
        )}
      </MainCard>

      <TiposArticuloDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <TiposArticuloEditDialog
        item={editItem}
        saving={saving}
        onClose={() => setEditItem(null)}
        onChange={(item) => setEditItem(item)}
        onSave={() => void saveEdit()}
        fieldErrors={editFieldErrors}
      />

      <TiposArticuloCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(payload) => void createTipo(payload)}
        fieldErrors={createFieldErrors}
      />
    </>
  );
}
