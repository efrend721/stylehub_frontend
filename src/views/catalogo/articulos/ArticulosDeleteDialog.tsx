import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  count: number;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArticulosDeleteDialog({ open, count, deleting, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-articulo-dialog-title">
      <DialogTitle id="delete-articulo-dialog-title">Eliminar Artículo(s)</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          ¿Está seguro de eliminar {count} artículo(s)? Esta acción es permanente.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}
