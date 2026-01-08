import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { Option, ProductosFilters } from './types';

interface Props {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  filters: ProductosFilters;
  setFilters: (next: ProductosFilters) => void;
  onClearFilters: () => void;
  tipoOptions: Option<number>[];
  categoriaOptions: Option<string>[];
  proveedorOptions: Option<number>[];
  onSearchProveedor: (query: string) => void;
  paperSx?: Record<string, unknown>;
}

export default function ProductosFiltersPopover({ anchorEl, open, onClose, filters, setFilters, onClearFilters, tipoOptions, categoriaOptions, proveedorOptions, onSearchProveedor, paperSx }: Props) {
  const id = open ? 'productos-filters-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            ...(paperSx || {})
          }
        }
      }}
    >
      <Box sx={{ p: 2, width: '100%' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Filtros</Typography>
        <Stack spacing={2}>
          <TextField
            label="Tipo"
            select
            fullWidth
            value={filters.id_tipo ?? ''}
            onChange={(e) => setFilters({ ...filters, id_tipo: e.target.value === '' ? null : Number(e.target.value) })}
          >
            <MenuItem value="">(Todos)</MenuItem>
            {tipoOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Categoría"
            select
            fullWidth
            value={filters.id_categoria ?? ''}
            onChange={(e) => setFilters({ ...filters, id_categoria: e.target.value === '' ? null : String(e.target.value) })}
          >
            <MenuItem value="">(Todas)</MenuItem>
            {categoriaOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={proveedorOptions}
            getOptionLabel={(opt) => opt.label}
            value={filters.id_proveedor == null || filters.id_proveedor === '' ? null : proveedorOptions.find((o) => o.value === filters.id_proveedor) || null}
            onChange={(_e, value) => setFilters({ ...filters, id_proveedor: value ? value.value : null })}
            onInputChange={(_e, input) => onSearchProveedor(input)}
            renderInput={(params) => (
              <TextField {...params} label="Proveedor" fullWidth placeholder="Buscar proveedor" />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Precio mín"
              type="number"
              value={filters.precio_min}
              onChange={(e) => setFilters({ ...filters, precio_min: e.target.value })}
              placeholder="0"
              fullWidth
            />
            <TextField
              label="Precio máx"
              type="number"
              value={filters.precio_max}
              onChange={(e) => setFilters({ ...filters, precio_max: e.target.value })}
              placeholder="0"
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Costo mín"
              type="number"
              value={filters.costo_min}
              onChange={(e) => setFilters({ ...filters, costo_min: e.target.value })}
              placeholder="0"
              fullWidth
            />
            <TextField
              label="Costo máx"
              type="number"
              value={filters.costo_max}
              onChange={(e) => setFilters({ ...filters, costo_max: e.target.value })}
              placeholder="0"
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ pt: 0.5, justifyContent: 'flex-end' }}>
            <Button variant="text" onClick={onClearFilters}>Limpiar filtros</Button>
            <Button variant="outlined" onClick={onClose}>Cerrar</Button>
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}
