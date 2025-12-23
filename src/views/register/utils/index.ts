export function validateRegisterFields(usuario_acceso: string, contrasena: string) {
  const errors: { usuario_acceso?: string; contrasena?: string } = {};
  if (!usuario_acceso) errors.usuario_acceso = 'Campo obligatorio';
  else if (usuario_acceso.length < 3) errors.usuario_acceso = 'Mínimo 3 caracteres';
  if (!contrasena) errors.contrasena = 'Campo obligatorio';
  else if (contrasena.length < 6) errors.contrasena = 'Mínimo 6 caracteres';
  return errors;
}
