import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { type MenuTreeNodeLocal } from '#/views/admin/menus/types';

export function DeleteDialog(props: {
  open: boolean;
  target: MenuTreeNodeLocal | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { open, target, onCancel, onConfirm } = props;
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {target ? `¿Desea eliminar "${target.titulo}" (${target.tipo})?` : '¿Desea eliminar este elemento?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm} autoFocus>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
