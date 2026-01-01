import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type { EstablecimientoSelect } from './useEstablecimientos';

export type UsuariosFilters = {
  est: string; // '' = todos
};

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  filters: UsuariosFilters;
  setFilters: (next: UsuariosFilters) => void;
  establecimientos: EstablecimientoSelect[];
};

export default function UsuariosFiltersPopover({ anchorEl, open, onClose, filters, setFilters, establecimientos }: Props) {
  const selected = establecimientos.find((e) => e.id_establecimiento === filters.est) ?? null;

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Stack spacing={2} sx={{ p: 2, width: 320 }}>
        <Autocomplete
          options={establecimientos}
          value={selected}
          onChange={(_, v) => setFilters({ ...filters, est: v?.id_establecimiento ?? '' })}
          getOptionLabel={(o) => o.nombre}
          isOptionEqualToValue={(a, b) => a.id_establecimiento === b.id_establecimiento}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Establecimiento"
              placeholder="Todos"
            />
          )}
          clearOnEscape
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="text"
            onClick={() => setFilters({ ...filters, est: '' })}
          >
            Limpiar
          </Button>
          <Button variant="contained" onClick={onClose}>
            Cerrar
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
}
