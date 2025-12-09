import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';

type GreetingVariant = 'Good Morning,' | 'Good Afternoon,' | 'Good Evening,' | 'Good Night,';

function getGreetingByHour(hour: number): GreetingVariant {
  if (hour >= 5 && hour < 12) return 'Good Morning,';
  if (hour >= 12 && hour < 18) return 'Good Afternoon,';
  if (hour >= 18 && hour < 23) return 'Good Evening,';
  return 'Good Night,';
}

export interface GreetingByHoursProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  sx?: SxProps;
}

export default function GreetingByHours({ variant = 'h4', sx }: GreetingByHoursProps) {
  const hour = new Date().getHours();
  const greeting = getGreetingByHour(hour);
  return (
    <Typography variant={variant} sx={sx}>
      {greeting}
    </Typography>
  );
}
