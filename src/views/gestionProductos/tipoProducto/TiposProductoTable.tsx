import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { TipoProducto } from './types';
import type { GridRowId } from '@mui/x-data-grid';

interface Props {
  rows: TipoProducto[];
  selectedIds: GridRowId[];
  deleting: boolean;
  selectionModel: GridRowSelectionModel;
  onSelectionModelChange: (model: GridRowSelectionModel) => void;
  onAskDelete: (ids: (string | number)[]) => void;
  onEdit: (item: TipoProducto) => void;
}

export function TiposProductoTable({
  rows,
  selectedIds,
  deleting,
  selectionModel,
  onSelectionModelChange,
  onAskDelete,
  onEdit
}: Props) {
  const columns: GridColDef<TipoProducto>[] = [
    { field: 'id_tipo', headerName: 'ID', width: 80 },
    { field: 'nombre_tipo', headerName: 'Nombre', flex: 1, minWidth: 200 },
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
              onClick={() => onAskDelete([params.row.id_tipo])}
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
        <Box sx={{ mb: 1 }}>
          <Tooltip title="Eliminar selección">
            <IconButton color="error" disabled={deleting} onClick={() => onAskDelete(selectedIds as (string | number)[])}>
              <IconTrash size={20} />
            </IconButton>
          </Tooltip>
          <span>{selectedIds.length} seleccionado(s)</span>
        </Box>
      )}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id_tipo}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={onSelectionModelChange}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        autoHeight
        sx={{ minHeight: 300 }}
      />
    </Box>
  );
}
