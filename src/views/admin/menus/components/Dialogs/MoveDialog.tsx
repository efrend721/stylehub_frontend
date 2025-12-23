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
import { type MenuTreeNodeLocal } from '#/views/admin/menus/types';

export function MoveDialog(props: {
  open: boolean;
  target: MenuTreeNodeLocal | null;
  parentCandidates: Array<{ id: number; label: string; disabled?: boolean }>;
  value: number | '';
  onChange: (v: number | '') => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const { open, target, parentCandidates, value, onChange, onCancel, onApply } = props;
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Mover nodo</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {target ? `Selecciona el nuevo parent para "${target.titulo}"` : 'Selecciona el nuevo parent'}
        </DialogContentText>
        <Stack sx={{ gap: 2 }}>
          <FormControl size="small">
            <InputLabel id="move-parent-label">Parent</InputLabel>
            <Select
              labelId="move-parent-label"
              label="Parent"
              value={value}
              onChange={(e) => {
                const raw = String(e.target.value);
                onChange(raw === '' ? '' : Number(raw));
              }}
            >
              <MenuItem value="">
                <em>Raíz (sin parent)</em>
              </MenuItem>
              {parentCandidates.map((opt) => (
                <MenuItem key={opt.id} value={opt.id} disabled={opt.disabled}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
        <Button variant="contained" onClick={onApply}>Mover</Button>
      </DialogActions>
    </Dialog>
  );
}
