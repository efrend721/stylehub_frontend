/**
 * Extrae el mensaje de error más específico disponible
 * Prioriza: details > message > fallback
 */
export function getErrorMessage(error: unknown, fallback = 'Error desconocido'): string {
  if (error instanceof Error) {
    const details = (error as { details?: string }).details;
    // Priorizar 'details' si existe (mensajes específicos del backend)
    return details || error.message || fallback;
  }
  return fallback;
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
