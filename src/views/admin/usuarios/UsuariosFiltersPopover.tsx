import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { EstablecimientoSelect } from './useEstablecimientos';
import type { RolSelect } from '#/views/admin/roles';
import type { UsuariosSearchEstado } from '#/services/usuarios/usuariosService';

export type UsuariosFilters = {
  est: string; // '' = todos
  rol: number | null; // null = todos
  estado?: UsuariosSearchEstado;
};

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onClear?: () => void;
  filters: UsuariosFilters;
  setFilters: (next: UsuariosFilters) => void;
  establecimientos: EstablecimientoSelect[];
  roles: RolSelect[];
  hideEstablecimiento?: boolean;
  paperSx?: Record<string, unknown>;
};

export default function UsuariosFiltersPopover({ anchorEl, open, onClose, onClear, filters, setFilters, establecimientos, roles, hideEstablecimiento = false, paperSx }: Props) {
  const selected = establecimientos.find((e) => e.id_establecimiento === filters.est) ?? null;
  const id = open ? 'usuarios-filters-popover' : undefined;

  const rolSelectProps = hideEstablecimiento
    ? {
      displayEmpty: true,
      renderValue: (selectedValue: unknown) => {
        if (selectedValue === '' || selectedValue == null) return 'Rol';
        const selectedId = Number(selectedValue);
        const match = roles.find((r) => Number(r.id_rol) === selectedId);
        return match?.nombre ?? String(selectedValue);
      }
    }
    : undefined;

  const estadoSelectProps = {
    displayEmpty: true,
    renderValue: (selectedValue: unknown) => {
      const v = String(selectedValue ?? '');
      if (v === '') return 'Estado';
      if (v === '1') return 'Solo activos';
      if (v === '0') return 'Solo inactivos';
      if (v === 'all') return 'Activos + inactivos';
      return v;
    },
    inputProps: {
      'aria-label': 'Estado'
    }
  };

  return (
    <Popover
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            width: 360
            ,...(paperSx || {})
          }
        }
      }}
    >
      <Box sx={{ p: 2, width: '100%' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Filtros</Typography>
        <Stack spacing={2}>
          {!hideEstablecimiento && (
            <Autocomplete
              options={establecimientos}
              value={selected}
              onChange={(_, v) => setFilters({ ...filters, est: v?.id_establecimiento ?? '' })}
              getOptionLabel={(o) => o.nombre}
              isOptionEqualToValue={(a, b) => a.id_establecimiento === b.id_establecimiento}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Establecimiento"
                  placeholder="Todos"
                  fullWidth
                />
              )}
              clearOnEscape
            />
          )}

          <TextField
            label={undefined}
            select
            fullWidth
            value={filters.estado ?? ''}
            onChange={(e) => {
              const v = String(e.target.value) as '' | UsuariosSearchEstado;
              setFilters({ ...filters, estado: v === '' ? undefined : v });
            }}
            slotProps={{
              select: {
                ...estadoSelectProps
              }
            }}
          >
            <MenuItem value="">Estado</MenuItem>
            <MenuItem value="1">Solo activos</MenuItem>
            <MenuItem value="0">Solo inactivos</MenuItem>
            <MenuItem value="all">Activos + inactivos</MenuItem>
          </TextField>

          <TextField
            label={hideEstablecimiento ? undefined : 'Rol'}
            select
            fullWidth
            value={filters.rol ?? ''}
            onChange={(e) => setFilters({ ...filters, rol: e.target.value === '' ? null : Number(e.target.value) })}
            slotProps={rolSelectProps ? { select: rolSelectProps } : undefined}
          >
            <MenuItem value="">(Todos)</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id_rol} value={r.id_rol}>{r.nombre}</MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1} sx={{ pt: 0.5, justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              onClick={() => {
                if (onClear) {
                  onClear();
                  return;
                }
                setFilters({ ...filters, est: '', rol: null, estado: hideEstablecimiento ? undefined : '1' });
              }}
            >
              Limpiar filtros
            </Button>
            <Button variant="outlined" onClick={onClose}>Cerrar</Button>
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
}
