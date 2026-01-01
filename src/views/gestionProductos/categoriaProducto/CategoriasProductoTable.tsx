import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { CategoriaProducto } from './types';
import type { GridRowId } from '@mui/x-data-grid';

interface Props {
  rows: CategoriaProducto[];
  selectedIds: GridRowId[];
  deleting: boolean;
  selectionModel: GridRowSelectionModel;
  onSelectionModelChange: (model: GridRowSelectionModel) => void;
  onAskDelete: (ids: (string | number)[]) => void;
  onEdit: (item: CategoriaProducto) => void;
}

export function CategoriasProductoTable({
  rows,
  selectedIds,
  deleting,
  selectionModel,
  onSelectionModelChange,
  onAskDelete,
  onEdit
}: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const columns: GridColDef<CategoriaProducto>[] = [
    { 
      field: 'id_categoria', 
      headerName: 'ID', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { field: 'nombre_categoria', headerName: 'Nombre', flex: 1, minWidth: 200 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(params.row)}>
              <IconEdit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              disabled={deleting}
              onClick={() => onAskDelete([params.row.id_categoria])}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {selectedIds.length > 0 && (
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Eliminar selección">
            <IconButton color="error" disabled={deleting} onClick={() => onAskDelete(selectedIds as (string | number)[])}>
              <IconTrash size={20} />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary">
            {selectedIds.length} seleccionado(s)
          </Typography>
        </Box>
      )}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id_categoria}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={onSelectionModelChange}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          autoHeight
          density={downSm ? 'compact' : 'standard'}
          getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'row--even' : 'row--odd')}
          sx={{
            minHeight: 300,
            minWidth: { xs: 520, sm: '100%' },
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
        />
      </Box>
    </Box>
  );
}
