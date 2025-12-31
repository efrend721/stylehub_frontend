import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

interface FilterToggleProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
}

export default function FilterToggle({ onClick, ariaLabel = 'Abrir filtros' }: FilterToggleProps) {
  return (
    <Tooltip title="Filtros">
      <IconButton aria-label={ariaLabel} onClick={onClick} size="medium">
        <IconAdjustmentsHorizontal stroke={1.75} size={24} />
      </IconButton>
    </Tooltip>
  );
}
