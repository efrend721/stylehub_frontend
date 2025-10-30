import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import type { Usuario } from './types';

type Props = {
  user: Usuario | null;
  saving: boolean;
  onClose: () => void;
  onChange: (user: Usuario) => void;
  onSave: () => void;
};

export function UsuariosEditDialog({ user, saving, onClose, onChange, onSave }: Props) {
  return (
    <Dialog open={!!user} onClose={() => (saving ? null : onClose())} maxWidth="sm" fullWidth>
      <DialogTitle>Modificar usuario</DialogTitle>
      <DialogContent>
        {user && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={user.nombre_usuario}
              onChange={(e) => onChange({ ...user, nombre_usuario: e.target.value })}
              fullWidth
            />
            <TextField
              label="Apellido"
              value={user.apellido_usuario}
              onChange={(e) => onChange({ ...user, apellido_usuario: e.target.value })}
              fullWidth
            />
            <TextField
              label="Correo"
              type="email"
              value={user.correo_electronico}
              onChange={(e) => onChange({ ...user, correo_electronico: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={user.estado === 1}
                  onChange={(e) => onChange({ ...user, estado: e.target.checked ? 1 : 0 })}
                />
              }
              label={user.estado === 1 ? 'Activo' : 'Inactivo'}
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
