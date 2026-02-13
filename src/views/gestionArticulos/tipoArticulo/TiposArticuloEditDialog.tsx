import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import { useRef } from 'react';
import type { TipoArticulo } from './types';

interface Props {
  item: TipoArticulo | null;
  saving: boolean;
  onClose: () => void;
  onChange: (item: TipoArticulo) => void;
  onSave: () => void;
  fieldErrors: Record<string, string>;
}

export function TiposArticuloEditDialog({ item, saving, onClose, onChange, onSave, fieldErrors }: Props) {
  const isOpen = !!item;
  const firstFieldRef = useFocusManagement<HTMLInputElement>(isOpen);
  
  // Aplicar atributo inert al fondo cuando el modal está abierto (accesibilidad)
  useInertBackground(isOpen);

  const currentIdRef = useRef<number | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);

  function normalizeForCompare(t: TipoArticulo) {
    return {
      nombre_tipo: (t.nombre_tipo ?? '').trim()
    };
  }

  if (!item) return null;

  if (currentIdRef.current !== item.id_tipo) {
    currentIdRef.current = item.id_tipo;
    initialSnapshotRef.current = JSON.stringify(normalizeForCompare(item));
  }

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.nombre_tipo.trim()) return;
    onSave();
  };

  const isDirty = initialSnapshotRef.current !== null && JSON.stringify(normalizeForCompare(item)) !== initialSnapshotRef.current;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      aria-labelledby="edit-tipo-dialog-title"
    >
      <DialogTitle id="edit-tipo-dialog-title">Editar Tipo de Artículo</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            inputRef={firstFieldRef}
            autoFocus
            margin="dense"
            label="Nombre del tipo"
            fullWidth
            value={item.nombre_tipo}
            onChange={(e) => onChange({ ...item, nombre_tipo: e.target.value })}
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
            disabled={saving || !item.nombre_tipo.trim() || !isDirty}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
