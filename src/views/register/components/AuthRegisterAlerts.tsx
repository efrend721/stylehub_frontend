import { type FC } from 'react';
import Alert from '@mui/material/Alert';
import { type AuthRegisterAlertsProps } from '../types';

export const AuthRegisterAlerts: FC<AuthRegisterAlertsProps> = ({ severity, message }) => (
  <div style={{ marginTop: 16 }}>
    <Alert severity={severity}>{message}</Alert>
  </div>
);
