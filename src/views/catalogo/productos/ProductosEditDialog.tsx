import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import { useEffect, useRef, useState } from 'react';
import type { Producto, UpdateProductoPayload, Option } from './types';

interface Props {
  item: Producto | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateProductoPayload) => void;
  fieldErrors: Record<string, string>;
  tipoOptions: Option<number>[];
  categoriaOptions: Option<string>[];
  proveedorOptions: Option<number>[];
  onSearchProveedor: (query: string) => void;
}

export function ProductosEditDialog({ item, saving, onClose, onSave, fieldErrors, tipoOptions, categoriaOptions, proveedorOptions, onSearchProveedor }: Props) {
  const open = !!item;
  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  useInertBackground(open);
  const [form, setForm] = useState<Producto | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);
  const currentIdRef = useRef<number | null>(null);
  const [manualPrecioFraccion, setManualPrecioFraccion] = useState(false);
  const [manualCostoFraccion, setManualCostoFraccion] = useState(false);
  const [precioInput, setPrecioInput] = useState<string>('');
  const [fraccionInput, setFraccionInput] = useState<string>('');
  const [costoInput, setCostoInput] = useState<string>('');

  function buildCompareSnapshot(source: Producto, precioText: string, fraccionText: string, costoText: string) {
    const precioNum = precioText === '' ? 0 : Number(precioText);
    const fraccionNum = fraccionText === '' ? 0 : Number(fraccionText);
    const costoNum = costoText === '' ? 0 : Number(costoText);

    const payload: UpdateProductoPayload = {
      nombre_producto: source.nombre_producto?.trim(),
      descripcion: source.descripcion?.trim() || null,
      fraccion: fraccionNum,
      costo: costoNum,
      costo_fraccion: (source.costo_fraccion !== null && source.costo_fraccion !== undefined) ? Number(source.costo_fraccion) : null,
      precio: precioNum,
      precio_fraccion: (source.precio_fraccion !== null && source.precio_fraccion !== undefined) ? Number(source.precio_fraccion) : null,
      id_tipo: source.id_tipo ?? null,
      id_categoria: source.id_categoria ?? null,
      id_proveedor: source.id_proveedor ?? null
    };

    return JSON.stringify(payload);
  }

  useEffect(() => {
    if (item) {
      setForm({ ...item });
      setManualPrecioFraccion(false);
      setManualCostoFraccion(false);
      setPrecioInput(String(item.precio ?? 0));
      setFraccionInput(String(item.fraccion ?? 0));
      setCostoInput(String(item.costo ?? 0));

      if (currentIdRef.current !== item.id_producto) {
        currentIdRef.current = item.id_producto;
        initialSnapshotRef.current = buildCompareSnapshot(item, String(item.precio ?? 0), String(item.fraccion ?? 0), String(item.costo ?? 0));
      }
    } else {
      setForm(null);
      setManualPrecioFraccion(false);
      setManualCostoFraccion(false);
      setPrecioInput('');
      setFraccionInput('');
      setCostoInput('');
      currentIdRef.current = null;
      initialSnapshotRef.current = null;
    }
  }, [item]);

  const isValid = !!form
    && form.nombre_producto.trim().length >= 2
    && Number(precioInput) >= 0
    && Number(fraccionInput) >= 0;

  const isDirty =
    !!form &&
    initialSnapshotRef.current !== null &&
    buildCompareSnapshot(form, precioInput, fraccionInput, costoInput) !== initialSnapshotRef.current;

  const handleSave = () => {
    if (!form || !isValid) return;
    const precioNum = precioInput === '' ? 0 : Number(precioInput);
    const fraccionNum = fraccionInput === '' ? 0 : Number(fraccionInput);
    const costoNum = costoInput === '' ? 0 : Number(costoInput);

    const payload: UpdateProductoPayload = {
      nombre_producto: form.nombre_producto?.trim(),
      descripcion: form.descripcion?.trim() || null,
      fraccion: fraccionNum,
      costo: costoNum,
      costo_fraccion: (form.costo_fraccion !== null && form.costo_fraccion !== undefined) ? Number(form.costo_fraccion) : null,
      precio: precioNum,
      precio_fraccion: (form.precio_fraccion !== null && form.precio_fraccion !== undefined) ? Number(form.precio_fraccion) : null,
      id_tipo: form.id_tipo ?? null,
      id_categoria: form.id_categoria ?? null,
      id_proveedor: form.id_proveedor ?? null
    };
    onSave(payload);
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="edit-producto-dialog-title"
    >
      <DialogTitle id="edit-producto-dialog-title">Editar Producto</DialogTitle>
      {form && (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                inputRef={firstFieldRef}
                autoFocus
                margin="dense"
                label="Nombre del producto"
                fullWidth
                value={form.nombre_producto}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, nombre_producto: e.target.value } : prev))}
                error={!!fieldErrors.nombre_producto}
                helperText={fieldErrors.nombre_producto || 'Requerido, 2..120 caracteres'}
                disabled={saving}
                slotProps={{ htmlInput: { maxLength: 120 } }}
                required
              />

              <TextField
                margin="dense"
                label="Descripción"
                fullWidth
                value={form.descripcion ?? ''}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, descripcion: e.target.value } : prev))}
                error={!!fieldErrors.descripcion}
                helperText={fieldErrors.descripcion || 'Opcional, hasta 255 caracteres'}
                disabled={saving}
                slotProps={{ htmlInput: { maxLength: 255 } }}
              />

              <TextField
                margin="dense"
                label="Tipo"
                select
                fullWidth
                value={form.id_tipo ?? ''}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, id_tipo: e.target.value === '' ? null : Number(e.target.value) } : prev))}
                error={!!fieldErrors.id_tipo}
                helperText={fieldErrors.id_tipo || 'Opcional'}
                disabled={saving}
              >
                <MenuItem value="">(Sin tipo)</MenuItem>
                {tipoOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="Categoría"
                select
                fullWidth
                value={form.id_categoria ?? ''}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, id_categoria: e.target.value === '' ? null : String(e.target.value) } : prev))}
                error={!!fieldErrors.id_categoria}
                helperText={fieldErrors.id_categoria || 'Opcional (máx 2 caracteres)'}
                disabled={saving}
              >
                <MenuItem value="">(Sin categoría)</MenuItem>
                {categoriaOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>

              <Autocomplete
                options={proveedorOptions}
                getOptionLabel={(opt) => opt.label}
                value={
                  form.id_proveedor == null ? null : proveedorOptions.find((o) => o.value === form.id_proveedor) || null
                }
                onChange={(_e, value) => setForm((prev) => (prev ? { ...prev, id_proveedor: value ? value.value : null } : prev))}
                onInputChange={(_e, input) => onSearchProveedor(input)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Proveedor"
                    fullWidth
                    error={!!fieldErrors.id_proveedor}
                    helperText={fieldErrors.id_proveedor || 'Opcional: escribe para buscar y seleccionar'}
                    disabled={saving}
                  />
                )}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  margin="dense"
                  label="Precio"
                  type="number"
                  value={precioInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPrecioInput(v);
                    if (v === '') return; // permitir limpiar completamente
                    const precio = Number(v);
                    setForm((prev) => {
                      if (!prev) return prev;
                      const next: Producto = { ...prev, precio: Number.isNaN(precio) ? prev.precio : precio };
                      if (!manualPrecioFraccion) {
                        if (next.fraccion && next.fraccion >= 1) {
                          next.precio_fraccion = Math.round(next.precio / next.fraccion);
                        } else {
                          next.precio_fraccion = null;
                        }
                      }
                      return next;
                    });
                  }}
                  placeholder="0"
                  error={!!fieldErrors.precio}
                  helperText={fieldErrors.precio || 'Requerido, mínimo 0'}
                  disabled={saving}
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                  required
                />
                <TextField
                  margin="dense"
                  label="Fracción"
                  type="number"
                  value={fraccionInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFraccionInput(v);
                    if (v === '') return; // permitir limpiar completamente
                    const fraccion = Number(v);
                    setForm((prev) => {
                      if (!prev) return prev;
                      const next: Producto = { ...prev, fraccion: Number.isNaN(fraccion) ? prev.fraccion : fraccion };
                      if (!manualPrecioFraccion) {
                        if (next.fraccion && next.fraccion >= 1) {
                          next.precio_fraccion = Math.round(next.precio / next.fraccion);
                        } else {
                          next.precio_fraccion = null;
                        }
                      }
                      if (!manualCostoFraccion) {
                        if (next.fraccion && next.fraccion >= 1) {
                          next.costo_fraccion = Math.round(next.costo / next.fraccion);
                        } else {
                          next.costo_fraccion = null;
                        }
                      }
                      return next;
                    });
                  }}
                  placeholder="0"
                  error={!!fieldErrors.fraccion}
                  helperText={fieldErrors.fraccion}
                  disabled={saving}
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Precio fracción"
                  type="number"
                  value={form.precio_fraccion ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value) || 0);
                    setForm((prev) => (prev ? { ...prev, precio_fraccion: val as number | null } : prev));
                    setManualPrecioFraccion(true);
                  }}
                  placeholder="0"
                  error={!!fieldErrors.precio_fraccion}
                  helperText={fieldErrors.precio_fraccion || 'Por defecto: precio / fracción (redondeado). Puedes ajustarlo.'}
                  disabled={saving}
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  margin="dense"
                  label="Costo"
                  type="number"
                  value={costoInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCostoInput(v);
                    if (v === '') return;
                    const costo = Number(v);
                    setForm((prev) => {
                      if (!prev) return prev;
                      const next: Producto = { ...prev, costo: Number.isNaN(costo) ? prev.costo : costo };
                      if (!manualCostoFraccion) {
                        if (next.fraccion && next.fraccion >= 1) {
                          next.costo_fraccion = Math.round(next.costo / next.fraccion);
                        } else {
                          next.costo_fraccion = null;
                        }
                      }
                      return next;
                    });
                  }}
                  placeholder="0"
                  error={!!fieldErrors.costo}
                  helperText={fieldErrors.costo || 'Opcional, mínimo 0'}
                  disabled={saving}
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Costo fracción"
                  type="number"
                  value={form.costo_fraccion ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value) || 0);
                    setForm((prev) => (prev ? { ...prev, costo_fraccion: val as number | null } : prev));
                    setManualCostoFraccion(true);
                  }}
                  placeholder="0"
                  error={!!fieldErrors.costo_fraccion}
                  helperText={fieldErrors.costo_fraccion || 'Por defecto: costo / fracción (redondeado). Puedes ajustarlo.'}
                  disabled={saving}
                  fullWidth
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !isValid || !isDirty}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Guardar
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
}
