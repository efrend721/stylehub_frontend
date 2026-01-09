import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import { CategoriasProductoList } from './CategoriasProductoList';
import { CategoriasProductoDeleteDialog } from './CategoriasProductoDeleteDialog';
import { CategoriasProductoEditDialog } from './CategoriasProductoEditDialog';
import { CategoriasProductoCreateDialog } from './CategoriasProductoCreateDialog';
import { useCategoriaProducto } from './useCategoriaProducto';

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
    fetchCategorias,
    createFieldErrors,
    editFieldErrors
  } = useCategoriaProducto();

  return (
    <MainCard
      title={
        downSm ? (
          <Typography variant="h5" sx={{ textAlign: 'center' }} noWrap>
            Gestión de Categorías de Producto
          </Typography>
        ) : (
          'Gestión de Categorías de Producto'
        )
      }
      secondary={
        downSm ? (
          <Tooltip title="Refrescar">
            <span>
              <IconButton onClick={() => void fetchCategorias()} disabled={loading} color="secondary">
                <IconRefresh size={20} />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Refrescar">
              <span>
                <IconButton onClick={() => void fetchCategorias()} disabled={loading} color="secondary">
                  <IconRefresh size={20} />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                openCreateDialog();
              }}
              startIcon={<IconPlus size="18" />}
            >
              Agregar Categoría
            </Button>
          </Box>
        )
      }
      headerSX={{
        '& .MuiCardHeader-content': { width: '100%', overflow: 'visible' },
        ...(downSm
          ? {
            py: 1,
            position: 'relative',
            '& .MuiCardHeader-action': {
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)'
            },
            '& .MuiCardHeader-title': {
              width: '100%',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }
          : null)
      }}
    >
      {downSm && (
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              (e.currentTarget as HTMLElement).blur();
              openCreateDialog();
            }}
            startIcon={<IconPlus size="18" />}
            sx={{ py: 0.75 }}
          >
            Agregar Categoría
          </Button>
        </Box>
      )}

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
