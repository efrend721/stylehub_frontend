import React, { useRef, useState } from 'react';
import { AuthLoginAlerts } from './';
import { validateLoginFields } from './';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { trim } from '#/utils/validators';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';

export function useAuthLogin() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ usuario_acceso?: string; contrasena?: string }>({});
  const alertHostRef = useRef<HTMLDivElement | null>(null);
  const alertRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const [formData, setFormData] = useState({ usuario_acceso: '', contrasena: '' });

  const showAlert = (severity: 'error' | 'success', message: string) => {
    if (!alertHostRef.current) return;
    if (!alertRootRef.current) {
      alertRootRef.current = createRoot(alertHostRef.current);
    }
    alertRootRef.current.render(
      React.createElement(AuthLoginAlerts, { severity, message })
    );
  };

  const clearAlert = () => {
    if (alertRootRef.current) {
      alertRootRef.current.unmount();
      alertRootRef.current = null;
    }
    if (alertHostRef.current) {
      alertHostRef.current.innerHTML = '';
    }
  };

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    clearAlert();
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAlert();
    const usuario = trim(formData.usuario_acceso);
    const password = trim(formData.contrasena);
    const nextFieldErrors = validateLoginFields(usuario, password);
    if (nextFieldErrors.usuario_acceso || nextFieldErrors.contrasena) {
      setFieldErrors(nextFieldErrors);
      showAlert('error', 'Por favor, corrige los campos marcados');
      return;
    }
    try {
  const res = await login({ usuario_acceso: usuario, contrasena: password }, checked);
      const backendMsg = (res as any)?.message as string | undefined;
      const nombre = res?.data?.user?.nombre_usuario ?? 'Usuario';
      const successMsg = backendMsg || `¡Bienvenido, ${nombre}!`;
      showAlert('success', successMsg);
      const toastId = notify.success(successMsg, { duration: 1000 });
      setTimeout(() => {
        notify.dismiss(toastId);
        navigate('/dashboard/default');
      }, 1000);
    } catch (_err) {
      // Los errores del backend se muestran como toast.error desde AuthContext.
    }
  };

  return {
    isLoading,
    checked,
    setChecked,
    showPassword,
    handleClickShowPassword,
    handleMouseDownPassword,
    fieldErrors,
    setFieldErrors,
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    alertHostRef
  };
}
