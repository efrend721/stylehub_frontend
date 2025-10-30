import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MainCard from '#/ui-component/cards/MainCard';
import { RolesTable } from './RolesTable';
import { RolesDeleteDialog } from './RolesDeleteDialog';
import { RolesEditDialog } from './RolesEditDialog';
import { useRoles } from './useRoles';
import type { GridRowSelectionModel } from '@mui/x-data-grid';

export default function AdminRolesPage() {
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
    doDeleteSelected,
    deleting,
    editRol,
    setEditRol,
    openEditFor,
    saveEdit,
    saving,
    fetchRoles
  } = useRoles();

  return (
    <MainCard
      title="Gestión de Roles"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => void fetchRoles()} disabled={loading}>
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
          <Typography>No hay roles.</Typography>
        </Box>
      ) : (
        <RolesTable
          rows={rows}
          selectedIds={selectedIds}
          deleting={deleting}
          selectionModel={selectionModel}
          onSelectionModelChange={(m: GridRowSelectionModel) => setSelectionModel(m)}
          onAskDelete={openConfirmFor}
          onEdit={openEditFor}
        />
      )}

      <RolesDeleteDialog
        open={confirmOpen}
        count={deleteIds.length}
        deleting={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void doDeleteSelected()}
      />

      <RolesEditDialog
        rol={editRol}
        saving={saving}
        onClose={() => setEditRol(null)}
        onChange={(r) => setEditRol(r)}
        onSave={() => void saveEdit()}
      />
    </MainCard>
  );
}
