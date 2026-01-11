import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import { useRef } from 'react';
import type { CategoriaProducto } from './types';

interface Props {
  item: CategoriaProducto | null;
  saving: boolean;
  onClose: () => void;
  onChange: (item: CategoriaProducto) => void;
  onSave: () => void;
  fieldErrors: Record<string, string>;
}

export function CategoriasProductoEditDialog({ item, saving, onClose, onChange, onSave, fieldErrors }: Props) {
  const isOpen = !!item;
  const firstFieldRef = useFocusManagement<HTMLInputElement>(isOpen);
  
  // Aplicar atributo inert al fondo cuando el modal está abierto (accesibilidad)
  useInertBackground(isOpen);

  const currentIdRef = useRef<string | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);

  function normalizeForCompare(c: CategoriaProducto) {
    return {
      nombre_categoria: (c.nombre_categoria ?? '').trim()
    };
  }

  if (!item) return null;

  if (currentIdRef.current !== item.id_categoria) {
    currentIdRef.current = item.id_categoria;
    initialSnapshotRef.current = JSON.stringify(normalizeForCompare(item));
  }

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.nombre_categoria.trim() || item.nombre_categoria.trim().length < 2) return;
    onSave();
  };

  const isValid = item.nombre_categoria.trim().length >= 2;
  const isDirty = initialSnapshotRef.current !== null && JSON.stringify(normalizeForCompare(item)) !== initialSnapshotRef.current;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      aria-labelledby="edit-categoria-dialog-title"
    >
      <DialogTitle id="edit-categoria-dialog-title">Editar Categoría de Producto</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                ID de categoría
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontFamily: 'monospace', fontWeight: 500 }}
              >
                {item.id_categoria}
              </Typography>
            </Box>
            <TextField
              inputRef={firstFieldRef}
              autoFocus
              margin="dense"
              label="Nombre de la categoría"
              fullWidth
              value={item.nombre_categoria}
              onChange={(e) => onChange({ ...item, nombre_categoria: e.target.value })}
              error={!!fieldErrors.nombre_categoria}
              helperText={fieldErrors.nombre_categoria || 'Entre 2 y 24 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 24 } }}
              required
            />
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
    </Dialog>
  );
}
