import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import type { Proveedor } from './types';

interface Props {
  item: Proveedor | null;
  saving: boolean;
  onClose: () => void;
  onChange: (item: Proveedor) => void;
  onSave: () => void;
  fieldErrors: Record<string, string>;
}

export function ProveedoresEditDialog({ item, saving, onClose, onChange, onSave, fieldErrors }: Props) {
  const isOpen = !!item;
  const firstFieldRef = useFocusManagement<HTMLInputElement>(isOpen);
  useInertBackground(isOpen);

  if (!item) return null;

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.nombre_proveedor.trim() || item.nombre_proveedor.trim().length < 2) return;
    onSave();
  };

  const isValid = item.nombre_proveedor.trim().length >= 2;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="edit-proveedor-dialog-title"
    >
      <DialogTitle id="edit-proveedor-dialog-title">Editar Proveedor</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              inputRef={firstFieldRef}
              autoFocus
              margin="dense"
              label="Nombre del proveedor"
              fullWidth
              value={item.nombre_proveedor}
              onChange={(e) => onChange({ ...item, nombre_proveedor: e.target.value })}
              error={!!fieldErrors.nombre_proveedor}
              helperText={fieldErrors.nombre_proveedor || 'Requerido, 2..60 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 60 } }}
              required
            />
            <TextField
              margin="dense"
              label="Dirección"
              fullWidth
              value={item.direccion ?? ''}
              onChange={(e) => onChange({ ...item, direccion: e.target.value })}
              error={!!fieldErrors.direccion}
              helperText={fieldErrors.direccion || 'Opcional, hasta 120 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <TextField
              margin="dense"
              label="Teléfono"
              fullWidth
              value={item.telefono ?? ''}
              onChange={(e) => onChange({ ...item, telefono: e.target.value })}
              error={!!fieldErrors.telefono}
              helperText={fieldErrors.telefono || 'Opcional, hasta 20 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 20 } }}
            />
            <TextField
              margin="dense"
              label="Representante"
              fullWidth
              value={item.representante ?? ''}
              onChange={(e) => onChange({ ...item, representante: e.target.value })}
              error={!!fieldErrors.representante}
              helperText={fieldErrors.representante || 'Opcional, hasta 60 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 60 } }}
            />
            <TextField
              margin="dense"
              label="Teléfono representante"
              fullWidth
              value={item.telefono_representante ?? ''}
              onChange={(e) => onChange({ ...item, telefono_representante: e.target.value })}
              error={!!fieldErrors.telefono_representante}
              helperText={fieldErrors.telefono_representante || 'Opcional, hasta 20 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 20 } }}
            />
            <FormControlLabel
              control={<Switch checked={item.activo === 1} onChange={(e) => onChange({ ...item, activo: e.target.checked ? 1 : 0 })} />}
              label="Activo"
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
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
