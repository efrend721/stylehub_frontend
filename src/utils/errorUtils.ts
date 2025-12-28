/**
 * Política de mensajes: mostrar solo el 'mensaje' del backend
 * Prioriza: message > fallback (ignora details)
 */
export function getErrorMessage(error: unknown, fallback = 'Error desconocido'): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
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
