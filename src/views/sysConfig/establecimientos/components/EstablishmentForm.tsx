import { Grid, Stack, TextField, Typography, Divider, Paper, MenuItem } from '@mui/material';
import type { Establecimiento, EstablecimientoTipo } from '../types/index.ts';
import { formatDateISO } from '../utils/index';

export interface EstablishmentFormProps {
  value: Establecimiento;
  tipos: EstablecimientoTipo[];
  errors?: Record<string, string | undefined>;
  onChange: (patch: Partial<Establecimiento>) => void;
}

export default function EstablishmentForm({ value, tipos, errors = {}, onChange }: EstablishmentFormProps) {
  const onText = (key: keyof Establecimiento) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value });
  const onDate = (key: keyof Establecimiento) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: formatDateISO(e.target.value) });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Datos del Establecimiento</Typography>
      <Stack spacing={3}>
        <TextField label="Nombre" value={value.nombre || ''} onChange={onText('nombre')} fullWidth required error={!!errors.nombre} helperText={errors.nombre}
        />
        <TextField label="Dirección" value={value.direccion || ''} onChange={onText('direccion')} fullWidth error={!!errors.direccion} helperText={errors.direccion}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Teléfono" value={value.telefono || ''} onChange={onText('telefono')} fullWidth error={!!errors.telefono} helperText={errors.telefono}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Celular" value={value.celular || ''} onChange={onText('celular')} fullWidth error={!!errors.celular} helperText={errors.celular}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="NIT"
              value={value.nit || ''}
              onChange={onText('nit')}
              fullWidth
              required
              error={!!errors.nit}
              helperText={errors.nit || 'Debe ser único'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Tipo de establecimiento"
              value={value.id_tipo ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                const next = val === '' ? null : Number(val);
                onChange({ id_tipo: Number.isFinite(next as number) ? (next as number) : null });
              }}
              fullWidth
              helperText={errors.id_tipo ?? (value.id_tipo == null ? 'No asignado' : undefined)}
            >
              <MenuItem value="">No asignado</MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo} value={t.id_tipo}>{t.descripcion}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <TextField label="Resolución" value={value.resolucion || ''} onChange={onText('resolucion')} fullWidth error={!!errors.resolucion} helperText={errors.resolucion}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="date"
              label="Fecha inicio"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formatDateISO(value.fecha_ini || value.desde || '')}
              onChange={onDate('fecha_ini')}
              fullWidth
              error={!!errors.fecha_ini}
              helperText={errors.fecha_ini ?? 'Formato YYYY-MM-DD'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="date"
              label="Fecha fin"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formatDateISO(value.fecha_fin || value.hasta || '')}
              onChange={onDate('fecha_fin')}
              fullWidth
              error={!!errors.fecha_fin}
              helperText={errors.fecha_fin ?? 'Formato YYYY-MM-DD; inicio ≤ fin'}
            />
          </Grid>
        </Grid>
        <Divider />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Mensaje 1" value={value.mensaje1 || ''} onChange={onText('mensaje1')} fullWidth multiline rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Mensaje 2" value={value.mensaje2 || ''} onChange={onText('mensaje2')} fullWidth multiline rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Mensaje 3" value={value.mensaje3 || ''} onChange={onText('mensaje3')} fullWidth multiline rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Mensaje 4" value={value.mensaje4 || ''} onChange={onText('mensaje4')} fullWidth multiline rows={2}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}
