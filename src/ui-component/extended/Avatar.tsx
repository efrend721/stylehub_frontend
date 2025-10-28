import PropTypes from 'prop-types';

// material-ui
import MuiAvatar from '@mui/material/Avatar';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ElementType } from 'react';

type AvatarColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | (string & {});
type AvatarSize = 'badge' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ExtendedAvatarProps {
  className?: string;
  color?: AvatarColor;
  outline?: boolean;
  size?: AvatarSize;
  sx?: SxProps<Theme>;
  component?: ElementType;
  [x: string]: any;
}

export default function Avatar({ className, color, outline, size, sx, ...others }: ExtendedAvatarProps) {
  const colorSX = color && !outline && { color: 'background.paper', bgcolor: `${color}.main` };
  const outlineSX = outline && {
    color: color ? `${color}.main` : `primary.main`,
    bgcolor: 'background.paper',
    border: '2px solid',
    borderColor: color ? `${color}.main` : `primary.main`
  };
  let sizeSX = {};

  switch (size) {
    case 'badge':
      sizeSX = { width: 28, height: 28 };
      break;
    case 'xs':
      sizeSX = { width: 34, height: 34 };
      break;
    case 'sm':
      sizeSX = { width: 40, height: 40 };
      break;
    case 'lg':
      sizeSX = { width: 72, height: 72 };
      break;
    case 'xl':
      sizeSX = { width: 82, height: 82 };
      break;
    case 'md':
      sizeSX = { width: 60, height: 60 };
      break;
    default:
      sizeSX = {};
  }

  return <MuiAvatar className={className} sx={{ ...colorSX, ...outlineSX, ...sizeSX, ...(sx as any) }} {...others} />;
}

Avatar.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  outline: PropTypes.bool,
  size: PropTypes.oneOf(['badge', 'xs', 'sm', 'md', 'lg', 'xl']),
  sx: PropTypes.any,
  others: PropTypes.any
};
