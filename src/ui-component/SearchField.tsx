import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import type { SxProps } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { IconSearch } from '@tabler/icons-react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
}

export default function SearchField({ value, onChange, placeholder = 'Buscar', sx }: SearchFieldProps) {

  return (
    <OutlinedInput
      id="search-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      startAdornment={
        <InputAdornment position="start">
          <IconSearch stroke={1.75} size={24} />
        </InputAdornment>
      }
      aria-describedby="search-helper-text"
      slotProps={{ input: { 'aria-label': 'search', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
      sx={{ width: { md: 250, lg: 340 }, ...sx }}
    />
  );
}
