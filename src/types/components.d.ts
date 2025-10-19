// Component prop types for Berry Dashboard components

import { ReactNode, Ref } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

export interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children: ReactNode;
  content?: boolean;
  contentClass?: string;
  contentSX?: SxProps<Theme>;
  headerSX?: SxProps<Theme>;
  darkTitle?: boolean;
  secondary?: ReactNode;
  shadow?: string;
  sx?: SxProps<Theme>;
  title?: ReactNode;
}

export interface SubCardProps {
  [x: string]: unknown;
  children: ReactNode;
  className?: unknown;
  content?: boolean;
  contentClass?: unknown;
  darkTitle?: unknown;
  secondary?: ReactNode;
  sx?: SxProps<Theme>;
  contentSX?: SxProps<Theme>;
  footerSX?: SxProps<Theme>;
  title?: ReactNode;
  actions?: unknown;
}

export interface TransitionsProps {
  [x: string]: unknown;
  children: ReactNode;
  position?: string;
  sx?: SxProps<Theme>;
  type?: string;
  direction?: string;
}

export interface BreadcrumbsProps {
  [x: string]: unknown;
  card?: unknown;
  custom?: boolean;
  divider?: boolean;
  heading?: ReactNode;
  icon?: boolean;
  icons?: unknown;
  links?: unknown;
  maxItems?: unknown;
  rightAlign?: boolean;
  separator?: React.ForwardRefExoticComponent<unknown>;
  title?: boolean;
  titleBottom?: unknown;
  sx?: SxProps<Theme>;
}

export interface SimpleBarProps {
  [x: string]: unknown;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export interface HeaderAvatarProps {
  [x: string]: unknown;
  children: ReactNode;
  ref?: Ref<unknown>;
}

export interface AnimateButtonProps {
  [x: string]: unknown;
  className?: unknown;
  color?: unknown;
  outline?: unknown;
  size?: unknown;
  sx?: SxProps<Theme>;
}

export interface ElevationScrollProps {
  children: ReactNode;
  window?: unknown;
}

export interface ColorBoxProps {
  bgcolor: string;
  title: string;
  data: {
    label: string;
    color: string;
  };
  dark?: unknown;
}

export interface SecondaryActionProps {
  title?: ReactNode;
  link: string;
  icon?: ReactNode;
}

export interface NavItemProps {
  item: unknown;
  level: unknown;
  isParents?: boolean;
  setSelectedID: unknown;
}
