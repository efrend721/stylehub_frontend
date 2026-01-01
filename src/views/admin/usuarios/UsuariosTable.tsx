import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, Toolbar, QuickFilter } from '@mui/x-data-grid';
import type { GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Usuario } from './types';

type Props = {
  rows: Usuario[];
  selectedIds: GridRowId[];
  deleting: boolean;
  selectionModel: GridRowSelectionModel;
  onSelectionModelChange: (m: GridRowSelectionModel) => void;
  onAskDelete: (ids: (string | number)[]) => void;
  onEdit: (user: Usuario) => void;
};

export function UsuariosTable({ rows, selectedIds, deleting, selectionModel, onSelectionModelChange, onAskDelete, onEdit }: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const columns: GridColDef<Usuario>[] = useMemo(
    () => [
      {
        field: 'usuario_acceso',
        headerName: 'Usuario',
        width: 130,
        sortable: true,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
            <Typography variant="body2">{params.row.usuario_acceso}</Typography>
          </Box>
        )
      },
      {
        field: 'nombre_usuario',
        headerName: 'Nombre',
        minWidth: 160,
        flex: 1,
        renderCell: (p) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
            <Typography variant="body2">{p.row.nombre_usuario}</Typography>
          </Box>
        )
      },
      {
        field: 'apellido_usuario',
        headerName: 'Apellido',
        minWidth: 160,
        flex: 1,
        renderCell: (p) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
            <Typography variant="body2">{p.row.apellido_usuario}</Typography>
          </Box>
        )
      },
      { field: 'correo_electronico', headerName: 'Correo', minWidth: 220, flex: 1.4 },
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
        minWidth: 150,
        flex: 1,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Tooltip title="Modificar">
              <IconButton size="small" onClick={() => onEdit(params.row)} aria-label="Modificar">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => onAskDelete([params.row.usuario_acceso])} aria-label="Eliminar">
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
    <Paper sx={{ width: '100%', height: { xs: 720, md: 780 } }}>
      <Box sx={{ width: '100%', height: '100%', overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.usuario_acceso}
          checkboxSelection
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          showToolbar
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          slots={{ toolbar: CustomToolbar }}
          sx={{
            border: 0,
            minWidth: { xs: 980, sm: '100%' },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center'
            },
            '& .MuiDataGrid-cellContent': {
              display: 'flex',
              alignItems: 'center',
              height: '100%'
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
