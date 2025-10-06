import { Box, Typography } from '@mui/material';
import { Spa, ContentCut } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'opacity']),
  '&:hover': {
    transform: 'scale(1.05)',
    opacity: 0.8,
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '& .spa-icon': {
    color: theme.palette.primary.main,
    fontSize: '1.8rem',
  },
  '& .cut-icon': {
    color: theme.palette.secondary.main,
    fontSize: '1.2rem',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(15deg)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.5rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

interface StyleHubLogoProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'inherit';
}

export const StyleHubLogo = ({ 
  showText = true, 
  size = 'medium',
  color = 'default' 
}: StyleHubLogoProps) => {
  const sizeMap = {
    small: { icon: 1.2, text: '1rem' },
    medium: { icon: 1.8, text: '1.5rem' },
    large: { icon: 2.4, text: '2rem' },
  };

  return (
    <LogoContainer>
      <IconContainer>
        <Spa 
          className="spa-icon" 
          sx={{ 
            fontSize: `${sizeMap[size].icon}rem`,
            color: color === 'inherit' ? 'inherit' : undefined 
          }} 
        />
        <ContentCut 
          className="cut-icon" 
          sx={{ 
            fontSize: `${sizeMap[size].icon * 0.6}rem`,
            color: color === 'inherit' ? 'inherit' : undefined 
          }} 
        />
      </IconContainer>
      
      {showText && (
        <LogoText 
          variant="h6" 
          sx={{ 
            fontSize: sizeMap[size].text,
            ...(color === 'inherit' && {
              background: 'none',
              WebkitTextFillColor: 'inherit',
              color: 'inherit'
            })
          }}
        >
          StyleHub
        </LogoText>
      )}
    </LogoContainer>
  );
};