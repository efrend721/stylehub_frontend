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
import { TiposProductoList } from './TiposProductoList';
import { TiposProductoDeleteDialog } from './TiposProductoDeleteDialog';
import { TiposProductoEditDialog } from './TiposProductoEditDialog';
import { TiposProductoCreateDialog } from './TiposProductoCreateDialog';
import { useTiposProducto } from './useTiposProducto';

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
    fetchTipos,
    createFieldErrors,
    editFieldErrors
  } = useTiposProducto();

  return (
    <MainCard
      title={
        downSm ? (
          <Typography variant="h5" sx={{ textAlign: 'center' }} noWrap>
            Gestión de Tipos de Producto
          </Typography>
        ) : (
          'Gestión de Tipos de Producto'
        )
      }
      secondary={
        downSm ? (
          <Tooltip title="Refrescar">
            <span>
              <IconButton onClick={() => void fetchTipos()} disabled={loading} color="secondary">
                <IconRefresh size={20} />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
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
            Agregar Tipo
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
          <Typography>No hay tipos de producto.</Typography>
        </Box>
      ) : (
        <TiposProductoList
          items={rows}
          onEdit={openEditFor}
          onAskDelete={(id) => openConfirmFor([id])}
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
