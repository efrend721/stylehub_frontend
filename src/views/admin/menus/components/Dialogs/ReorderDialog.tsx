import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { type MenuTreeNodeLocal } from '#/views/admin/menus/types';

export function ReorderDialog(props: {
  open: boolean;
  target: MenuTreeNodeLocal | null;
  optionsCount: number;
  value: number;
  onChange: (v: number) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const { open, target, optionsCount, value, onChange, onCancel, onApply } = props;
  const options = Array.from({ length: Math.max(optionsCount, 1) }, (_, i) => i + 1);
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Reordenar nodo</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {target ? `Nueva posición para "${target.titulo}"` : 'Selecciona la posición'}
        </DialogContentText>
        <Stack sx={{ gap: 2 }}>
          <FormControl size="small">
            <InputLabel id="reorder-index-label">Posición</InputLabel>
            <Select
              labelId="reorder-index-label"
              label="Posición"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
            >
              {options.map((i) => (
                <MenuItem key={i} value={i}>{i === 1 ? '1 (primero)' : i}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Posición dentro del grupo</FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
        <Button variant="contained" onClick={onApply}>Aplicar</Button>
      </DialogActions>
    </Dialog>
  );
}
