import { styled } from '@mui/material/styles';
import { Paper, TextField, Button } from '@mui/material';

export const LoginContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(8),
  borderRadius: 12, // theme.shape.borderRadius * 1.5
  boxShadow: theme.shadows[3],
  background: theme.palette.background.paper,
}));

export const LoginForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const LoginField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
    },
  },
}));

export const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['box-shadow', 'transform']),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));