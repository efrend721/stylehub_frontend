import { FormControlLabel, Switch } from '@mui/material';

export interface StatusToggleProps {
  value?: number; // 1 activo, 0 inactivo
  onChange: (next: number) => void;
}

export default function StatusToggle({ value = 1, onChange }: StatusToggleProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={value === 1}
          onChange={(e) => onChange(e.target.checked ? 1 : 0)}
          color="primary"
        />
      }
      label={value === 1 ? 'Activo' : 'Inactivo'}
    />
  );
}
