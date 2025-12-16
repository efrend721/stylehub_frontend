import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';

type GreetingVariant = 'Good Morning,' | 'Good Afternoon,' | 'Good Evening,' | 'Good Night,';

function getGreetingByHour(hour: number): GreetingVariant {
  const ranges: Array<{ start: number; end: number; label: GreetingVariant }> = [
    { start: 5, end: 12, label: 'Good Morning,' },
    { start: 12, end: 18, label: 'Good Afternoon,' },
    { start: 18, end: 23, label: 'Good Evening,' }
  ];
  const match = ranges.find((r) => hour >= r.start && hour < r.end);
  return match?.label ?? 'Good Night,';
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
