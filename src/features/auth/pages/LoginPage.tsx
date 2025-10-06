import { Container, Box } from '@mui/material';
import { LoginContainer } from '../container';

export const LoginPage = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoginContainer />
      </Box>
    </Container>
  );
};