import PropTypes from 'prop-types';
import { ReactNode } from 'react';
// material-ui
import { styled, Theme } from '@mui/material/styles';
import MuiInputLabel from '@mui/material/InputLabel';

interface InputLabelProps {
  children: ReactNode;
  horizontal?: boolean;
}

const BInputLabel = styled((props: InputLabelProps) => <MuiInputLabel {...props} />, {
  shouldForwardProp: (prop) => prop !== 'horizontal'
})<{ horizontal?: boolean }>(({ theme, horizontal }: { theme: Theme; horizontal?: boolean }) => ({
  color: theme.vars.palette.text.primary,
  fontWeight: 500,
  marginBottom: horizontal ? 0 : 8
}));

export default function InputLabel({ children, horizontal = false, ...others }: InputLabelProps & Record<string, unknown>) {
  return (
    <BInputLabel horizontal={horizontal} {...others}>
      {children}
    </BInputLabel>
  );
}

InputLabel.propTypes = { children: PropTypes.any, horizontal: PropTypes.bool, others: PropTypes.any };
