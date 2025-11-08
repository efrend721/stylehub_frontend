import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { IconPlus } from '@tabler/icons-react';
import MainCard from '#/ui-component/cards/MainCard';
import { UsuariosTable } from './UsuariosTable';
import { UsuariosDeleteDialog } from './UsuariosDeleteDialog';
import { UsuariosEditDialog } from './UsuariosEditDialog';
import { UsuariosCreateDialog } from './UsuariosCreateDialog';
import { useUsuarios } from './useUsuarios';
import type { GridRowSelectionModel } from '@mui/x-data-grid';

export default function AdminUsuariosPage() {
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
    editUser,
    setEditUser,
    openEditFor,
    saveEdit,
    saving,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    createUser,
    creating,
    fetchUsuarios
  } = useUsuarios();

  return (
    <MainCard
      title="Gestión de Usuarios"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            onClick={openCreateDialog}
            startIcon={<IconPlus size="18" />}
          >
            Agregar Usuario
          </Button>
          <Button onClick={() => void fetchUsuarios()} disabled={loading}>
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
          <Typography>No hay usuarios.</Typography>
        </Box>
      ) : (
        <UsuariosTable
          rows={rows}
          selectedIds={selectedIds}
          deleting={deleting}
          selectionModel={selectionModel}
          onSelectionModelChange={(m: GridRowSelectionModel) => setSelectionModel(m)}
          onAskDelete={openConfirmFor}
          onEdit={openEditFor}
        />
      )}

      <UsuariosDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doBulkDelete()}
      />

      <UsuariosEditDialog
        user={editUser}
        saving={saving}
        onClose={() => setEditUser(null)}
        onChange={(u) => setEditUser(u)}
        onSave={() => void saveEdit()}
      />

      <UsuariosCreateDialog
        open={createDialogOpen}
        saving={creating}
        onClose={closeCreateDialog}
        onSave={(usuario) => void createUser(usuario)}
      />
    </MainCard>
  );
}
