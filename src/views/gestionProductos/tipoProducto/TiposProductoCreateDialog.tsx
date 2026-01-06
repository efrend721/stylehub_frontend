import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import type { CreateTipoProductoPayload } from './types';

interface Props {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateTipoProductoPayload) => void;
  fieldErrors: Record<string, string>;
}

export function TiposProductoCreateDialog({ open, saving, onClose, onSave, fieldErrors }: Props) {
  const [nombreTipo, setNombreTipo] = useState('');
  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  
  // Aplicar atributo inert al fondo cuando el modal está abierto (accesibilidad)
  useInertBackground(open);

  // Reset form cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setNombreTipo('');
    }
  }, [open]);

  const handleSave = () => {
    if (!nombreTipo.trim()) return;
    onSave({ nombre_tipo: nombreTipo.trim() });
  };

  const handleClose = () => {
    if (saving) return;
    setNombreTipo('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      aria-labelledby="create-tipo-dialog-title"
    >
      <DialogTitle id="create-tipo-dialog-title">Crear Tipo de Producto</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            inputRef={firstFieldRef}
            autoFocus
            margin="dense"
            label="Nombre del tipo"
            fullWidth
            value={nombreTipo}
            onChange={(e) => setNombreTipo(e.target.value)}
            error={!!fieldErrors.nombre_tipo}
            helperText={fieldErrors.nombre_tipo || ' '}
            disabled={saving}
            slotProps={{ htmlInput: { maxLength: 50 } }}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !nombreTipo.trim()}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Crear
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
