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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useFocusManagement, useInertBackground } from '#/hooks/useFocusManagement';
import type { CreateProveedorPayload } from './types';

interface Props {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateProveedorPayload) => void;
  fieldErrors: Record<string, string>;
}

export function ProveedoresCreateDialog({ open, saving, onClose, onSave, fieldErrors }: Props) {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [representante, setRepresentante] = useState('');
  const [telefonoRep, setTelefonoRep] = useState('');
  const [activo, setActivo] = useState(true);

  const firstFieldRef = useFocusManagement<HTMLInputElement>(open);
  useInertBackground(open);

  useEffect(() => {
    if (open) {
      setNombre('');
      setDireccion('');
      setTelefono('');
      setRepresentante('');
      setTelefonoRep('');
      setActivo(true);
    }
  }, [open]);

  const handleSave = () => {
    if (nombre.trim().length < 2) return;
    const payload: CreateProveedorPayload = {
      nombre_proveedor: nombre.trim(),
      direccion: direccion?.trim() || undefined,
      telefono: telefono?.trim() || undefined,
      representante: representante?.trim() || undefined,
      telefono_representante: telefonoRep?.trim() || undefined,
      activo: activo ? 1 : 0
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

  const isValid = nombre.trim().length >= 2;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="create-proveedor-dialog-title"
    >
      <DialogTitle id="create-proveedor-dialog-title">Crear Proveedor</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              inputRef={firstFieldRef}
              autoFocus
              margin="dense"
              label="Nombre del proveedor"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              error={!!fieldErrors.direccion}
              helperText={fieldErrors.direccion || 'Opcional, hasta 120 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <TextField
              margin="dense"
              label="Teléfono"
              fullWidth
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={!!fieldErrors.telefono}
              helperText={fieldErrors.telefono || 'Opcional, hasta 20 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 20 } }}
            />
            <TextField
              margin="dense"
              label="Representante"
              fullWidth
              value={representante}
              onChange={(e) => setRepresentante(e.target.value)}
              error={!!fieldErrors.representante}
              helperText={fieldErrors.representante || 'Opcional, hasta 60 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 60 } }}
            />
            <TextField
              margin="dense"
              label="Teléfono representante"
              fullWidth
              value={telefonoRep}
              onChange={(e) => setTelefonoRep(e.target.value)}
              error={!!fieldErrors.telefono_representante}
              helperText={fieldErrors.telefono_representante || 'Opcional, hasta 20 caracteres'}
              disabled={saving}
              slotProps={{ htmlInput: { maxLength: 20 } }}
            />
            <FormControlLabel
              control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />}
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
            Crear
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
