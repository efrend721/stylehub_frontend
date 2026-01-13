import { useState, useEffect } from 'react';
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
import type { CreateProductoPayload, Option } from './types';

interface Props {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: Omit<CreateProductoPayload, 'id_establecimiento'>) => void;
  fieldErrors: Record<string, string>;
  tipoOptions: Option<number>[];
  categoriaOptions: Option<string>[];
  proveedorOptions: Option<number>[];
  onSearchProveedor: (query: string) => void;
}

export function ProductosCreateDialog({ open, saving, onClose, onSave, fieldErrors, tipoOptions, categoriaOptions, proveedorOptions, onSearchProveedor }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fraccion, setFraccion] = useState<number>(0);
  const [precio, setPrecio] = useState<number>(0);
  const [precioInput, setPrecioInput] = useState<string>('0');
  const [fraccionInput, setFraccionInput] = useState<string>('0');
  const [costo, setCosto] = useState<number>(0);
  const [costoInput, setCostoInput] = useState<string>('0');
  const [precioFraccion, setPrecioFraccion] = useState<number | ''>(0);
  const [precioFraccionManual, setPrecioFraccionManual] = useState<boolean>(false);
  const [costoFraccion, setCostoFraccion] = useState<number | ''>(0);
  const [costoFraccionManual, setCostoFraccionManual] = useState<boolean>(false);
  const [idTipo, setIdTipo] = useState<number | ''>('');
  const [idCategoria, setIdCategoria] = useState<string | ''>('');
  const [idProveedor, setIdProveedor] = useState<number | ''>('');

  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  useInertBackground(open);

  useEffect(() => {
    if (open) {
      setNombre('');
      setDescripcion('');
      setFraccion(0);
      setFraccionInput('0');
      setPrecio(0);
      setPrecioInput('0');
      setCosto(0);
      setCostoInput('0');
      setPrecioFraccion(0);
      setCostoFraccion(0);
      setIdTipo('');
      setIdCategoria('');
      setIdProveedor('');
      setPrecioFraccionManual(false);
      setCostoFraccionManual(false);
    }
  }, [open]);

  // Calcular automáticamente precio por fracción cuando cambie precio o fracción
  useEffect(() => {
    if (!precioFraccionManual) {
      if (fraccionInput.trim() !== '' && precioInput.trim() !== '') {
        if (fraccion && fraccion >= 1) {
          const calc = Math.round(precio / fraccion);
          setPrecioFraccion(calc);
        } else {
          setPrecioFraccion(0);
        }
      } else {
        setPrecioFraccion(0);
      }
    }
  }, [precio, fraccion, precioFraccionManual, precioInput, fraccionInput]);

  useEffect(() => {
    if (!costoFraccionManual) {
      if (fraccionInput.trim() !== '' && costoInput.trim() !== '') {
        if (fraccion && fraccion >= 1) {
          const calc = Math.round(costo / fraccion);
          setCostoFraccion(calc);
        } else {
          setCostoFraccion(0);
        }
      } else {
        setCostoFraccion(0);
      }
    }
  }, [costo, fraccion, costoFraccionManual, costoInput, fraccionInput]);

  const handleSave = () => {
    const precioNum = Number(precioInput);
    const fraccionNum = Number(fraccionInput);
    const costoNum = Number(costoInput);
    const payload: Omit<CreateProductoPayload, 'id_establecimiento'> = {
      nombre_producto: nombre.trim(),
      descripcion: descripcion?.trim() || undefined,
      fraccion: Number.isNaN(fraccionNum) ? 0 : fraccionNum,
      precio: precioNum,
      costo: costoNum,
      costo_fraccion: costoFraccion === '' ? undefined : Number(costoFraccion),
      precio_fraccion: precioFraccion === '' ? undefined : Number(precioFraccion),
      id_tipo: idTipo === '' ? undefined : Number(idTipo),
      id_categoria: idCategoria === '' ? undefined : String(idCategoria),
      id_proveedor: idProveedor === '' ? undefined : Number(idProveedor)
    };
    onSave(payload);
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const isValid = nombre.trim().length >= 2
    && precioInput.trim() !== ''
    && fraccionInput.trim() !== ''
    && Number(precioInput) >= 0
    && Number(fraccionInput) >= 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="create-producto-dialog-title"
    >
      <DialogTitle id="create-producto-dialog-title">Crear Producto</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              inputRef={firstFieldRef}
              autoFocus
              margin="dense"
              label="Nombre del producto"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
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
              value={idTipo}
              onChange={(e) => setIdTipo(e.target.value === '' ? '' : Number(e.target.value))}
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
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value as string)}
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
                idProveedor === '' ? null : proveedorOptions.find((o) => o.value === idProveedor) || null
              }
              onChange={(_e, value) => setIdProveedor(value ? value.value : '')}
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
                label="Costo"
                type="number"
                value={costoInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setCostoInput(v);
                  if (v === '') return; // permitir limpiar
                  const n = Number(v);
                  setCosto(Number.isNaN(n) ? 0 : n);
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
                label="Fracción"
                type="number"
                value={fraccionInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setFraccionInput(v);
                  if (v === '') return; // permitir limpiar
                  const n = Number(v);
                  setFraccion(Number.isNaN(n) ? 0 : n);
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
                label="Precio"
                type="number"
                value={precioInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setPrecioInput(v);
                  if (v === '') return; // permitir limpiar
                  const n = Number(v);
                  setPrecio(Number.isNaN(n) ? 0 : n);
                }}
                placeholder="0"
                error={!!fieldErrors.precio}
                helperText={fieldErrors.precio || 'Requerido, mínimo 0'}
                disabled={saving}
                slotProps={{ htmlInput: { min: 0 } }}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                margin="dense"
                label="Costo Fracción"
                type="number"
                value={costoFraccion}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0);
                  setCostoFraccion(val);
                  setCostoFraccionManual(true);
                }}
                placeholder="0"
                error={!!fieldErrors.costo_fraccion}
                helperText={fieldErrors.costo_fraccion || 'Por defecto: costo / fracción (redondeado). Puedes ajustarlo.'}
                disabled={saving}
                slotProps={{ htmlInput: { min: 0 } }}
                fullWidth
              />

              <TextField
                margin="dense"
                label="Precio Fracción"
                type="number"
                value={precioFraccion}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0);
                  setPrecioFraccion(val);
                  setPrecioFraccionManual(true);
                }}
                placeholder="0"
                error={!!fieldErrors.precio_fraccion}
                helperText={fieldErrors.precio_fraccion || 'Por defecto: precio / fracción (redondeado). Puedes ajustarlo.'}
                disabled={saving}
                slotProps={{ htmlInput: { min: 0 } }}
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
            disabled={saving || !isValid}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Crear
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
