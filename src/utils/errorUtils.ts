/**
 * Política de mensajes (guía integración):
 * - 422: usar errors[] (join por \n), fallback a details
 * - otros: preferir details cuando exista (login suele venir en details)
 */
export function getErrorMessage(error: unknown, fallback = 'Error desconocido'): string {
  if (!(error instanceof Error)) return fallback;

  const status = (error as { status?: number }).status;
  const details = (error as { details?: unknown }).details;
  const errs = (error as { errors?: unknown }).errors;

  if (status === 422 && Array.isArray(errs)) {
    const msgs = errs
      .map((e) => (e && typeof e === 'object' ? (e as { message?: unknown }).message : undefined))
      .filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
      .map((m) => m.trim());
    if (msgs.length) return msgs.join('\n');
  }

  if (typeof details === 'string' && details.trim()) return details.trim();
  return error.message || fallback;
}

/**
 * Retorna el arreglo de errores de validación si el backend lo envió
 */
export type ValidationErrorEntry = {
  origin?: string;
  code?: string;
  path?: string[];
  message?: string;
  format?: string;
  pattern?: string | RegExp | null;
};

export function getErrorArray(error: unknown): ValidationErrorEntry[] {
  if (error && typeof error === 'object') {
    const errs = (error as { errors?: unknown }).errors;
    if (Array.isArray(errs)) {
      return errs as ValidationErrorEntry[];
    }
  }
  return [];
}

/**
 * Obtiene el código de estado HTTP de un error ApiError
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof Error) {
    return (error as { status?: number }).status;
  }
  return undefined;
}
