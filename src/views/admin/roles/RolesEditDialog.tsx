import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import type { Rol } from './types';

type Props = {
  rol: Rol | null;
  saving: boolean;
  onClose: () => void;
  onChange: (rol: Rol) => void;
  onSave: () => void;
};

export function RolesEditDialog({ rol, saving, onClose, onChange, onSave }: Props) {
  return (
    <Dialog 
      open={!!rol} 
      onClose={() => (saving ? null : onClose())} 
      maxWidth="sm" 
      fullWidth
      disableRestoreFocus
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="edit-rol-dialog-title"
    >
      <DialogTitle id="edit-rol-dialog-title">Modificar rol</DialogTitle>
      <DialogContent>
        {rol && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={rol.nombre}
              onChange={(e) => onChange({ ...rol, nombre: e.target.value })}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={rol.descripcion}
              onChange={(e) => onChange({ ...rol, descripcion: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={rol.estado === 1}
                  onChange={(e) => onChange({ ...rol, estado: e.target.checked ? 1 : 0 })}
                />
              }
              label={rol.estado === 1 ? 'Activo' : 'Inactivo'}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={onSave} variant="contained" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
