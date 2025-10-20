import React from 'react';
import Alert from '@mui/material/Alert';

export interface AuthRegisterAlertsProps {
  severity: 'error' | 'success';
  message: string;
}

export const AuthRegisterAlerts: React.FC<AuthRegisterAlertsProps> = ({ severity, message }) => (
  <div style={{ marginTop: 16 }}>
    <Alert severity={severity}>{message}</Alert>
  </div>
);
