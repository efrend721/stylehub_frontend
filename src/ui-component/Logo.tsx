// material-ui
import { useTheme } from '@mui/material/styles';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={colorScheme === ThemeMode.DARK ? logoDark : logo} alt="StyleHub" width="180" />
     *
     */
    <svg width="180" height="50" viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon - Stylish "S" with hub design */}
      <g>
        <circle cx="25" cy="25" r="21" fill={theme.vars.palette.primary.main} fillOpacity="0.1"/>
        <circle cx="25" cy="25" r="14.5" fill={theme.vars.palette.primary.main} fillOpacity="0.2"/>
        <path 
          d="M12.5 18C12.5 15.5 15 13 18 13C21 13 23.5 15.5 23.5 18C23.5 20.5 21 23 18 23C15 23 12.5 20.5 12.5 18Z
           M26.5 32C26.5 34.5 29 37 32 37C35 37 37.5 34.5 37.5 32C37.5 29.5 35 27 32 27C29 27 26.5 29.5 26.5 32Z" 
          fill={theme.vars.palette.secondary.main}
        />
        <path 
          d="M18 15.5C15.8 15.5 14.5 16.8 14.5 19C14.5 21.2 15.8 22.5 18 22.5C20.2 22.5 21.5 21.2 21.5 19C21.5 16.8 20.2 15.5 18 15.5Z
           M32 27.5C29.8 27.5 28.5 28.8 28.5 31C28.5 33.2 29.8 34.5 32 34.5C34.2 34.5 35.5 33.2 35.5 31C35.5 28.8 34.2 27.5 32 27.5Z" 
          fill={theme.vars.palette.primary.main}
        />
        <line x1="20.5" y1="20.5" x2="28.5" y2="28.5" stroke={theme.vars.palette.primary.main} strokeWidth="3.5" strokeLinecap="round"/>
      </g>
      
      {/* Text - StyleHub */}
      <g transform="translate(54, 11)">
        {/* Style */}
        <text x="0" y="22" 
              fontSize="24" 
              fontWeight="700" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              fill={theme.vars.palette.primary.main}>
          Style
        </text>
        {/* Hub */}
        <text x="58" y="22" 
              fontSize="24" 
              fontWeight="700" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              fill={theme.vars.palette.secondary.main}>
          Hub
        </text>
      </g>
    </svg>
  );
}
