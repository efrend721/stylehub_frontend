import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

type Props = {
  open: boolean;
  count: number;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function UsuariosDeleteDialog({ open, count, deleting, onCancel, onConfirm }: Props) {
  return (
    <Dialog 
      open={open} 
      onClose={() => (deleting ? null : onCancel())}
      disableRestoreFocus
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          ¿Seguro que deseas eliminar {count} usuario(s)? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={deleting}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting} autoFocus>
          {deleting ? 'Eliminando…' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
