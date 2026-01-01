import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, Toolbar, QuickFilter } from '@mui/x-data-grid';
import type { GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Rol } from '../types';

type Props = {
  rows: Rol[];
  selectedIds: GridRowId[];
  deleting: boolean;
  selectionModel: GridRowSelectionModel;
  onSelectionModelChange: (m: GridRowSelectionModel) => void;
  onAskDelete: (ids: (string | number)[]) => void;
  onEdit: (rol: Rol) => void;
};

export function RolesTable({ rows, selectedIds, deleting, selectionModel, onSelectionModelChange, onAskDelete, onEdit }: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const columns: GridColDef<Rol>[] = useMemo(
    () => [
      {
        field: 'id_rol',
        headerName: 'ID',
        width: 90,
      },
      { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 160 },
      { field: 'descripcion', headerName: 'Descripción', flex: 1.5, minWidth: 220 },
      {
        field: 'estado',
        headerName: 'Estado',
        width: 120,
        type: 'singleSelect',
        valueOptions: [
          { value: 1, label: 'Activo' },
          { value: 0, label: 'Inactivo' }
        ],
        renderCell: (params) => (
          <Chip label={params.value === 1 ? 'Activo' : 'Inactivo'} color={params.value === 1 ? 'success' : 'default'} size="small" />
        )
      },
      {
        field: 'acciones',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Modificar">
              <IconButton size="small" onClick={() => onEdit(params.row)} aria-label="Modificar">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => onAskDelete([params.row.id_rol])} aria-label="Eliminar">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    [onAskDelete, onEdit]
  );

  const CustomToolbar = useCallback(
    () => (
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, width: '100%' }}>
          <QuickFilter parser={(searchText) => searchText.split(/\s+/).filter(Boolean)} />
          <Box sx={{ flexGrow: 1 }} />
          {selectedIds.length > 1 && (
            <Button color="error" variant="contained" onClick={() => onAskDelete(selectedIds)} disabled={deleting}>
              {deleting ? 'Eliminando…' : `Eliminar por Grupos (${selectedIds.length})`}
            </Button>
          )}
        </Box>
      </Toolbar>
    ),
    [selectedIds, deleting, onAskDelete]
  );

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id_rol}
          checkboxSelection
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          showToolbar
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          slots={{ toolbar: CustomToolbar }}
          sx={{
            border: 0,
            minWidth: { xs: 740, sm: '100%' },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center'
            },
            '& .MuiDataGrid-row.row--even': {
              bgcolor: 'action.hover'
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.selected'
            },
            '& .MuiDataGrid-row.Mui-selected': {
              bgcolor: 'action.selected'
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              bgcolor: 'action.selected'
            }
          }}
          getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'row--even' : 'row--odd')}
          density={downSm ? 'compact' : 'standard'}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={onSelectionModelChange}
        />
      </Box>
    </Paper>
  );
}
