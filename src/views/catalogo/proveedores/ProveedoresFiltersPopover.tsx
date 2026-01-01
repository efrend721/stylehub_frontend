import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { IconX } from '@tabler/icons-react';

export interface ProveedoresFilters {
  estado: 'todos' | 'activos' | 'inactivos';
}

interface ProveedoresFiltersPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  filters: ProveedoresFilters;
  setFilters: (f: ProveedoresFilters) => void;
  onClearFilters: () => void;
}

export default function ProveedoresFiltersPopover({
  anchorEl,
  open,
  onClose,
  filters,
  setFilters,
  onClearFilters
}: ProveedoresFiltersPopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{ paper: { sx: { width: 300, p: 2, mt: 1 } } }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Filtros</Typography>
          <IconButton size="small" onClick={onClose}><IconX size={18} /></IconButton>
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel>Estado</InputLabel>
          <Select
            value={filters.estado}
            label="Estado"
            onChange={(e) => {
              setFilters({ ...filters, estado: String(e.target.value) as ProveedoresFilters['estado'] });
            }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="activos">Activos</MenuItem>
            <MenuItem value="inactivos">Inactivos</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" color="inherit" onClick={onClearFilters}>Limpiar</Button>
          <Button size="small" variant="contained" onClick={onClose}>Aplicar</Button>
        </Stack>
      </Stack>
    </Popover>
  );
}
