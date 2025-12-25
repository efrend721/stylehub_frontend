// project imports

// assets
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// ==============================|| OVERRIDES - ALERT ||============================== //

export default function Alert(theme) {
  const { vars } = theme;

  const getPaletteColor = (severity) => (severity ? vars.palette[severity] : vars.palette.info);

  const standardVariant = ({ ownerState }) => {
    const paletteColor = getPaletteColor(ownerState.severity);

    return {
      // Use light background with dark/main foreground for readability
      color: paletteColor.dark,
      backgroundColor: paletteColor.light,
      '& .MuiAlert-icon': { color: paletteColor.dark }
    };
  };

  const outlinedVariant = ({ ownerState }) => {
    const paletteColor = getPaletteColor(ownerState.severity);

    return {
      color: paletteColor.dark,
      borderColor: paletteColor.light,
      '& .MuiAlert-icon': { color: paletteColor.dark }
    };
  };

  const filledVariant = ({ ownerState }) => {
    const paletteColor = getPaletteColor(ownerState.severity);

    return {
      // Align filled variant with light scheme for alerts/messages
      color: paletteColor.dark,
      backgroundColor: paletteColor.light,
      '& .MuiAlert-icon': { color: paletteColor.dark }
    };
  };

  return {
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          primary: <InfoOutlinedIcon sx={{ fontSize: 'inherit' }} />
        }
      },
      styleOverrides: {
        root: {
          alignItems: 'center',
          variants: [
            { props: { variant: 'standard' }, style: standardVariant },
            { props: { variant: 'outlined' }, style: outlinedVariant },
            { props: { variant: 'filled' }, style: filledVariant }
          ]
        },
        outlined: { border: '1px dashed' }
      }
    }
  };
}
