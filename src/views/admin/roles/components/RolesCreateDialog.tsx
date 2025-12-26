import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useState } from 'react';
import type { CreateRolPayload, Rol } from '../types';
import { useCreateRole } from '../hooks';

type Props = {
  open: boolean;
  token?: string;
  onClose: () => void;
  onCreated?: (rol: Rol) => void;
};

export function RolesCreateDialog({ open, token, onClose, onCreated }: Props) {
  const { create, isLoading } = useCreateRole();
  const [form, setForm] = useState<CreateRolPayload>({ nombre: '', descripcion: '', estado: 1 });

  const handleSave = async () => {
    // Cliente: validación mínima (largo)
    const nombre = (form.nombre || '').trim();
    if (nombre.length < 2 || nombre.length > 50) {
      // Mensaje manejado por toasts desde hook via backend, pero hacemos validación básica
      return;
    }
    const payload: CreateRolPayload = {
      nombre,
      descripcion: (form.descripcion || '').trim() || undefined,
      estado: form.estado ?? 1
    };
    const rol = await create(payload, token);
    if (rol) {
      onCreated?.(rol);
      onClose();
      setForm({ nombre: '', descripcion: '', estado: 1 });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => (isLoading ? null : onClose())}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="create-rol-dialog-title"
    >
      <DialogTitle id="create-rol-dialog-title">Crear rol</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre"
            placeholder="Nombre del rol"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            slotProps={{ htmlInput: { maxLength: 50 } }}
            required
            fullWidth
          />
          <TextField
            label="Descripción"
            placeholder="Descripción (opcional)"
            value={form.descripcion || ''}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={(form.estado ?? 1) === 1}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.checked ? 1 : 0 }))}
              />
            }
            label={(form.estado ?? 1) === 1 ? 'Activo' : 'Inactivo'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? 'Creando…' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
