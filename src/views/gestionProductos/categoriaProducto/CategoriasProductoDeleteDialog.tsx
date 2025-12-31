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

export function CategoriasProductoDeleteDialog({ open, count, deleting, onCancel, onConfirm }: Props) {
  // Aplicar atributo inert al fondo cuando el modal está abierto (accesibilidad)
  useInertBackground(open);

  const handleCancel = () => {
    if (deleting) return;
    onCancel();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      aria-labelledby="delete-categoria-dialog-title"
      aria-describedby="delete-categoria-dialog-description"
    >
      <DialogTitle id="delete-categoria-dialog-title">Confirmar eliminación</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-categoria-dialog-description">
          ¿Está seguro de eliminar {count} categoría(s) de producto? 
          Esta acción no se puede deshacer y puede afectar productos asociados.
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
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
