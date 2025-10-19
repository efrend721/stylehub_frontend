// Global type declarations for development
declare module '*' {
  const content: unknown;
  export default content;
}

declare global {
  interface Window {
    location: unknown;
  }
}

// Fix for React ApexCharts
declare module 'react-apexcharts' {
  export interface Props {
    [key: string]: unknown;
  }
}

// Fix for Material-UI theme
declare module '@mui/material/styles' {
  interface TypographyVariantsOptions {
    [key: string]: unknown;
  }
  interface Theme {
    [key: string]: unknown;
  }
}

// Flexible component props
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FlexibleProps {
  [key: string]: unknown;
  children?: React.ReactNode;
}

export {};
