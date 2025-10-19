import { Link } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';

import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AuthRegister from '../auth-forms/AuthRegister';

export default function Register() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Stack sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Stack sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
          <Box sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
            <AuthCardWrapper>
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Link to="#" aria-label="theme logo">
                    <Logo />
                  </Link>
                </Box>
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main', mb: 0 }}>
                    Registro
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '16px', textAlign: { xs: 'center', md: 'inherit' } }}>
                    Ingresa tus datos para continuar
                  </Typography>
                </Stack>
                <Box>
                  <AuthRegister />
                </Box>
                <Divider sx={{ width: 1 }} />
                <Stack sx={{ alignItems: 'center' }}>
                  <Typography component={Link} to="/login" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                    ¿Ya tienes una cuenta?
                  </Typography>
                </Stack>
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>
        <Stack sx={{ px: 3, mb: 3, mt: 1 }}>
          <AuthFooter />
        </Stack>
      </Stack>
    </AuthWrapper1>
  );
}
