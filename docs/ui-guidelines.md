# UI Guidelines: Cancel Buttons (App-wide)

This guideline standardizes the presentation of "Cancelar" across dialogs and views to improve clarity and safety.

## Principles

- Use `variant="outlined"` for the cancel action in dialogs and forms.
- Reserve `variant="contained"` for primary actions (e.g., Guardar, Confirmar, Eliminar).
- Maintain consistent ordering: Cancel first (left), primary action second (right).
- Prefer descriptive labels: "Cancelar", "Cerrar", or "Volver" depending on context.
- Accessibility: ensure buttons have `aria-label` if the text alone may be ambiguous.

## Update Forms: Disable Save Until Changes

For update/edit flows ("Modificar", "Editar"), avoid no-op submissions.

- Disable the primary action (e.g., "Guardar") while there are no changes (`!isDirty`).
- Re-enable when the user actually changes any relevant field.
- Keep `saving`/loading state as the highest priority: `disabled={saving || !isDirty}`.

Notes:

- If there is optional data gated by a toggle (e.g., "Cambiar contraseña"), include that toggle in the dirty logic.
- Prefer normalizing values before compare (trim strings, map empty to null when your API does).

## MUI Patterns

- Dialogs: place actions in `DialogActions`, cancel outlined, primary contained.
- Forms: where both cancel and submit exist, mirror the dialog style.
- Confirmation flows: outlined cancel conveys a non-destructive, safe exit.

## Example (MUI v7, TSX)

```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useMemo } from 'react';

type Props = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
};

export function ConfirmDialog({ open, title, onCancel, onConfirm, confirmLabel = 'Confirmar' }: Props) {
  // For update dialogs, compute a boolean like this and disable the primary action:
  // - isDirty is derived from initial values vs current values
  // - saving comes from the async request state
  const saving = false;
  const isDirty = useMemo(() => true, []);

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent />
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={onCancel} aria-label="Cancelar">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          aria-label={confirmLabel}
          autoFocus
          disabled={saving || !isDirty}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Rollout Checklist

- Audit dialogs and forms for cancel buttons.
- Update cancel buttons to `variant="outlined"`.
- Verify layout order in `DialogActions` (Cancel, then primary).
- For update/edit dialogs, disable "Guardar" when there are no changes (`disabled={saving || !isDirty}`).
- Confirm semantic labels and `aria-label`s are correct.
- Smoke test: open dialogs to validate visual consistency.

## Notes

- Keep icon usage minimal; if used, prefer simple icons aligned with action semantics.
- Align spacing with theme defaults; avoid custom margins unless necessary.
