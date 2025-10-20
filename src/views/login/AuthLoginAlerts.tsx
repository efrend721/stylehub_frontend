import React from 'react';

export interface AuthLoginAlertsProps {
  severity: 'error' | 'success';
  message: string;
}

export const AuthLoginAlerts: React.FC<AuthLoginAlertsProps> = ({ severity, message }) => (
  <div style={{ marginTop: 16 }}>
    <div role="alert" style={{ color: severity === 'error' ? 'red' : 'green' }}>{message}</div>
  </div>
);
