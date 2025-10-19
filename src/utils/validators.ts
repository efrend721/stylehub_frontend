// Simple, reusable validators (no UI, no side effects)

export const trim = (v: string) => v?.trim?.() ?? '';

export const isNonEmpty = (v: string) => trim(v).length > 0;

// Basic email regex (practical, not fully RFC)
export const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trim(v));

// Username: letters, numbers, dot, underscore, hyphen; 3-32 chars
export const sanitizeUsername = (v: string) => trim(v).toLowerCase().replace(/[^a-z0-9._-]/g, '');
export const isValidUsername = (v: string) => /^[a-z0-9._-]{3,32}$/.test(trim(v));

// Password policy: min 8, at least 1 lowercase, 1 uppercase, 1 digit
export const validatePassword = (v: string): string | null => {
  const value = trim(v);
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[a-z]/.test(value)) return 'La contraseña debe incluir al menos una letra minúscula';
  if (!/[A-Z]/.test(value)) return 'La contraseña debe incluir al menos una letra mayúscula';
  if (!/[0-9]/.test(value)) return 'La contraseña debe incluir al menos un número';
  return null;
};

// Phone: optional +, then 7-15 digits
export const isValidPhone = (v: string) => v === '' || /^\+?[0-9]{7,15}$/.test(trim(v));
