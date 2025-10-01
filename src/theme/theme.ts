import { createTheme } from '@mui/material/styles';

// Tema profesional y sobrio para aplicaciones corporativas
export const appTheme = createTheme({
  palette: {
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    primary: {
      main: "#2563eb", // Azul profesional
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#64748b", // Gris azulado
      light: "#94a3b8",
      dark: "#475569",
    },
    success: {
      main: "#059669", // Verde profesional
      light: "#10b981",
      dark: "#047857",
    },
    warning: {
      main: "#d97706", // Naranja profesional
      light: "#f59e0b",
      dark: "#b45309",
    },
    error: {
      main: "#dc2626", // Rojo profesional
      light: "#ef4444",
      dark: "#b91c1c",
    },
    info: {
      main: "#0891b2", // Cyan profesional
      light: "#06b6d4",
      dark: "#0e7490",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            borderColor: "#cbd5e1",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
});