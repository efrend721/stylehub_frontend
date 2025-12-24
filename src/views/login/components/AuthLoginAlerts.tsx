import { type FC } from 'react';
import Alert from '@mui/material/Alert';
import { type AuthLoginAlertsProps } from '../types';

export const AuthLoginAlerts: FC<AuthLoginAlertsProps> = ({ severity, message }) => (
  <div style={{ marginTop: 16 }}>
    <Alert severity={severity}>{message}</Alert>
  </div>
);
