import { API_BASE, createHeaders, isApiResponse, ApiResponse } from '#/services/common/types';
import { ApiError, ValidationErrorEntry } from './errors';

export interface RequestOptions {
  token?: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  silent?: boolean; // Si es true, retorna null en lugar de lanzar error (útil para verificar sesión)
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  try { return await res.json(); } catch { return {}; }
}

export async function http<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { token, method = 'GET', body, headers } = opts;
  const mergedHeaders: Record<string, string> = { ...createHeaders(token), ...(headers ?? {}) };
  const [input, init]: [RequestInfo, RequestInit] = [
    `${API_BASE}${path}`,
    {
      method,
      headers: mergedHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include' // Permite enviar y recibir httpOnly cookies
    }
  ];
  const res = await fetch(input, init);
  const raw = await parseJsonSafe(res);
  
  // Si silent: true y hay error, retornar null
  if (opts.silent && !res.ok) {
    return null as unknown as T;
  }
  
  // Manejar respuestas de error del backend (con campo 'error' en lugar de 'success')
  if (!res.ok && raw && typeof raw === 'object') {
    const errorObj = raw as { error?: string; message?: string; mensaje?: string; details?: string; errors?: unknown };
    const hasStructured = errorObj.error || errorObj.message || errorObj.mensaje || errorObj.details || errorObj.errors;
    if (hasStructured) {
      // El backend envió una respuesta estructurada de error
      const msg = errorObj.mensaje || errorObj.message || errorObj.error || `HTTP ${res.status}`;
      const details = errorObj.details;
      const errs = Array.isArray(errorObj.errors) ? (errorObj.errors as ValidationErrorEntry[]) : undefined;
      throw new ApiError(msg, res.status, details, errs);
    }
  }
  
  if (!isApiResponse<T>(raw)) {
    throw new ApiError(`HTTP ${res.status}`, res.status);
  }
  
  const api: ApiResponse<T> = raw;
  if (!res.ok || !api.success) {
    const anyRaw = raw as { mensaje?: unknown; message?: unknown; details?: string; errors?: unknown };
    let msg: string;
    if (typeof anyRaw.mensaje === 'string') {
      msg = String(anyRaw.mensaje);
    } else if (typeof api.message === 'string') {
      msg = String(api.message);
    } else {
      msg = `HTTP ${res.status}`;
    }
    const details = anyRaw.details;
    const errs = Array.isArray(anyRaw.errors) ? (anyRaw.errors as ValidationErrorEntry[]) : undefined;
    throw new ApiError(msg, res.status, details, errs);
  }
  if (typeof api.data === 'undefined') {
    return undefined as unknown as T;
  }
  return api.data as unknown as T;
}
