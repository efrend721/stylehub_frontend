// Extend MUI theme and types for Berry Dashboard

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    commonAvatar: React.CSSProperties;
    mediumAvatar: React.CSSProperties;
    smallAvatar: React.CSSProperties;
    largeAvatar: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    commonAvatar?: React.CSSProperties;
    mediumAvatar?: React.CSSProperties;
    smallAvatar?: React.CSSProperties;
    largeAvatar?: React.CSSProperties;
  }

  interface ThemeVars {
    customShadows: {
      primary: string;
      secondary: string;
      orange: string;
      success: string;
      warning: string;
      error: string;
      z1: string;
    };
  }

  interface PaletteColor {
    200?: string;
    800?: string;
  }

  interface Palette {
    orange: PaletteColor;
  }

  interface PaletteOptions {
    orange?: PaletteColor;
  }

  interface TypeText {
    dark?: string;
  }
}

// Extend component props
declare module '@mui/material/styles' {
  interface Theme {
    colorSchemes?: {
      light: Record<string, unknown>;
      dark: Record<string, unknown>;
    };
  }

  interface ThemeOptions {
    colorSchemes?: {
      light: Record<string, unknown>;
      dark?: Record<string, unknown>;
    };
    cssVariables?: {
      cssVarPrefix?: string;
      colorSchemeSelector?: string;
    };
  }
}

export {};
