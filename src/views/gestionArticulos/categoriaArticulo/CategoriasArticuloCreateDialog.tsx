import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import type { CreateCategoriaArticuloPayload } from './types';

interface Props {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateCategoriaArticuloPayload) => void;
  fieldErrors: Record<string, string>;
}

export function CategoriasArticuloCreateDialog({ open, saving, onClose, onSave, fieldErrors }: Props) {
  const [idCategoria, setIdCategoria] = useState('');
  const [nombreCategoria, setNombreCategoria] = useState('');
  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  
  // Aplicar atributo inert al fondo cuando el modal está abierto (accesibilidad)
  useInertBackground(open);

  // Reset form cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setIdCategoria('');
      setNombreCategoria('');
    }
  }, [open]);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir 2 caracteres alfanuméricos y convertir a mayúsculas
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2);
    setIdCategoria(value);
  };

  const handleSave = () => {
    if (
      !idCategoria.trim() ||
      idCategoria.length < 1 ||
      idCategoria.length > 2 ||
      !nombreCategoria.trim()
    )
      return;
    onSave({ 
      id_categoria: idCategoria.toUpperCase().trim(), 
      nombre_categoria: nombreCategoria.trim() 
    });
  };

  const handleClose = () => {
    if (saving) return;
    setIdCategoria('');
    setNombreCategoria('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const isValid =
    idCategoria.trim().length >= 1 &&
    idCategoria.trim().length <= 2 &&
    nombreCategoria.trim().length >= 2;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      aria-labelledby="create-categoria-dialog-title"
    >
      <DialogTitle id="create-categoria-dialog-title">Crear Categoría de Artículo</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              inputRef={firstFieldRef}
              autoFocus
              margin="dense"
              label="ID de categoría"
              placeholder="Ej: BE, AL, SN"
              fullWidth
              value={idCategoria}
              onChange={handleIdChange}
              error={!!fieldErrors.id_categoria}
              helperText={fieldErrors.id_categoria || '1 o 2 caracteres alfanuméricos'}
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 2,
                  style: { textTransform: 'uppercase', fontFamily: 'monospace' }
                }
              }}
              required
            />
            <TextField
              margin="dense"
              label="Nombre de la categoría"
              fullWidth
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
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
