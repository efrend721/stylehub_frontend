import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';
import { AuthRegisterAlerts } from './index';
import { validateRegisterFields } from './registerUtils';
import { strengthColor, strengthIndicator } from '#/utils/password-strength';
import { isEmail, trim, validatePassword, isValidPhone, sanitizeUsername, isValidUsername } from '#/utils/validators';

export function useAuthRegister() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState<{ label: string; color: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    nombre_usuario?: string;
    apellido_usuario?: string;
    correo_electronico?: string;
    telefono?: string;
    usuario_acceso?: string;
    contrasena?: string;
  }>({});
  const alertHostRef = useRef<HTMLDivElement | null>(null);
  const alertRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    correo_electronico: '',
    usuario_acceso: '',
    contrasena: '',
    telefono: ''
  });

  const showAlert = (severity: 'error' | 'success', message: string) => {
    if (!alertHostRef.current) return;
    if (!alertRootRef.current) {
      alertRootRef.current = createRoot(alertHostRef.current);
    }
    alertRootRef.current.render(React.createElement(AuthRegisterAlerts, { severity, message }));
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

  // Genera usuario_acceso a partir del email
  const generateUsuarioAcceso = (email: string): string => {
    if (!email) return '';
    const emailParts = email.split('@');
    return emailParts[0] || '';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    clearAlert();
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'correo_electronico') {
        newData.usuario_acceso = generateUsuarioAcceso(value);
      }
      return newData;
    });
    if (name === 'contrasena') {
      changePassword(value);
    }
  };

  const changePassword = (value: string) => {
    // strengthIndicator y strengthColor deben importarse en el archivo
    // @ts-ignore
    const temp = strengthIndicator(value);
    // @ts-ignore
    setStrength(temp);
    // @ts-ignore
    setLevel(strengthColor(temp));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAlert();
    // Validaciones básicas
    const nombre = trim(formData.nombre_usuario);
    const apellido = trim(formData.apellido_usuario);
    const correo = trim(formData.correo_electronico);
    const telefono = trim(formData.telefono);
    const usuarioAcceso = trim(formData.usuario_acceso);
    const contrasena = trim(formData.contrasena);

    const nextFieldErrors: {
      nombre_usuario?: string;
      apellido_usuario?: string;
      correo_electronico?: string;
      telefono?: string;
      usuario_acceso?: string;
      contrasena?: string;
    } = {};

    if (!nombre) nextFieldErrors.nombre_usuario = 'Campo obligatorio';
    if (!apellido) nextFieldErrors.apellido_usuario = 'Campo obligatorio';
    if (!correo) nextFieldErrors.correo_electronico = 'Campo obligatorio';
    // isEmail debe importarse
    // @ts-ignore
    else if (!isEmail(correo)) nextFieldErrors.correo_electronico = 'Correo inválido';

    if (!contrasena) nextFieldErrors.contrasena = 'Campo obligatorio';
    // validatePassword debe importarse
    // @ts-ignore
    else {
      // @ts-ignore
      const pwdError = validatePassword(contrasena);
      if (pwdError) nextFieldErrors.contrasena = pwdError;
    }

    // isValidPhone debe importarse
    // @ts-ignore
    if (telefono && !isValidPhone(telefono)) {
      nextFieldErrors.telefono = 'Formato de teléfono inválido';
    }

    // Normaliza usuario_acceso y valida patrón
    // sanitizeUsername, isValidUsername deben importarse
    // @ts-ignore
    const usuarioNormalizado = sanitizeUsername(usuarioAcceso);
    // @ts-ignore
    if (!usuarioNormalizado || !isValidUsername(usuarioNormalizado)) {
      setFieldErrors(nextFieldErrors);
      showAlert('error', 'El usuario de acceso no se generó correctamente');
      return;
    }

    if (!checked) {
      setFieldErrors(nextFieldErrors);
      showAlert('error', 'Debes aceptar los términos y condiciones');
      return;
    }

    if (
      nextFieldErrors.nombre_usuario ||
      nextFieldErrors.apellido_usuario ||
      nextFieldErrors.correo_electronico ||
      nextFieldErrors.telefono ||
      nextFieldErrors.contrasena
    ) {
      setFieldErrors(nextFieldErrors);
      showAlert('error', 'Por favor, corrige los campos marcados');
      return;
    }

    try {
      const registerData = {
        usuario_acceso: usuarioNormalizado,
        contrasena,
        nombre_usuario: nombre,
        apellido_usuario: apellido,
        correo_electronico: correo,
        ...(telefono && { telefono })
      };
      const response = await register(registerData);
      if (response.success) {
        const successMsg = `¡Usuario registrado exitosamente! Usuario: ${response.data.usuario_acceso}`;
        showAlert('success', successMsg);
        notify.success(successMsg);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
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
    alertHostRef,
    strength,
    level
  };
}
