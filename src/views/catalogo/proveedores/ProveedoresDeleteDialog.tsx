import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useInertBackground } from '#/hooks/useFocusManagement';

interface Props {
  open: boolean;
  count: number;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ProveedoresDeleteDialog({ open, count, deleting, onCancel, onConfirm }: Props) {
  useInertBackground(open);

  const handleCancel = () => {
    if (deleting) return;
    onCancel();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      aria-labelledby="delete-proveedor-dialog-title"
      aria-describedby="delete-proveedor-dialog-description"
    >
      <DialogTitle id="delete-proveedor-dialog-title">Confirmar desactivación</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-proveedor-dialog-description">
          ¿Está seguro de desactivar {count} proveedor(es)? Esta acción marca "activo = 0".
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={deleting}>
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={deleting} 
          startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Desactivar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
