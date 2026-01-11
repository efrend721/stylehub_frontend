import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

interface FilterToggleProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  disabled?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

export default function FilterToggle({ onClick, ariaLabel, disabled = false, label = 'Filtros', size = 'medium', sx }: FilterToggleProps) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      size={size}
      startIcon={<IconAdjustmentsHorizontal stroke={1.75} size={20} />}
      sx={{ whiteSpace: 'nowrap', ...sx }}
    >
      {label}
    </Button>
  );
}
