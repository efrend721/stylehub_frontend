import { useState } from 'react';
import type { FormEvent } from 'react';
import { Typography, Alert, Box } from '@mui/material';
import { StyleHubLogo } from '../../../../common/components';
import { useLogin } from '../../hooks';
import {
  LoginContainer,
  LoginForm,
  LoginField,
  LoginButton,
} from './LoginForm.styles';

export const LoginFormComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, isLoading, error } = useLogin();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <LoginContainer elevation={3}>
      <Box sx={{ mb: 3 }}>
        <StyleHubLogo size="large" />
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Iniciar Sesión
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}

      <LoginForm onSubmit={onSubmit}>
        <LoginField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <LoginField
          fullWidth
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <LoginButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </LoginButton>
      </LoginForm>
    </LoginContainer>
  );
};