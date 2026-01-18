import { API_BASE, createHeaders, isApiResponse, ApiResponse } from '#/services/common/types';
import { ApiError, ValidationErrorEntry } from './errors';
import { notifyUnauthorized } from './authEvents';

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

type RawErrorShape = {
  success?: unknown;
  error?: unknown;
  message?: unknown;
  mensaje?: unknown;
  details?: unknown;
  errors?: unknown;
};

function extractValidationErrors(raw: RawErrorShape): ValidationErrorEntry[] | undefined {
  const errs = raw?.errors;
  if (!Array.isArray(errs)) return undefined;
  return errs as ValidationErrorEntry[];
}

function asNonEmptyString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return s ? s : undefined;
}

function resolveErrorMessage(status: number, raw: RawErrorShape): string {
  const details = asNonEmptyString(raw.details);
  const message = asNonEmptyString(raw.mensaje) ?? asNonEmptyString(raw.message);
  const error = asNonEmptyString(raw.error);
  const validationErrors = extractValidationErrors(raw);

  // Guía frontend: 422 usa errors[] (y fallback a details)
  if (status === 422) {
    const msgs = (validationErrors ?? [])
      .map((e) => asNonEmptyString(e?.message))
      .filter((m): m is string => Boolean(m));
    if (msgs.length) return msgs.join('\n');
    if (details) return details;
    if (message) return message;
    return 'Error de validación';
  }

  // Guía frontend: 503 usa error
  if (status === 503) {
    return error ?? message ?? details ?? 'Servicio no disponible';
  }

  // 401/403/404/500: usar message (y fallback razonable)
  return message ?? details ?? error ?? `HTTP ${status}`;
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

  // 401 global: sesión expirada / cookie inválida
  // - No disparamos en silent (ej: /auth/me) para evitar dobles efectos.
  if (res.status === 401 && !opts.silent) {
    const errShape = raw && typeof raw === 'object' ? (raw as RawErrorShape) : undefined;
    const msg = errShape ? resolveErrorMessage(401, errShape) : 'No autenticado';
    notifyUnauthorized({ status: 401, message: msg });
  }
  
  // Si silent: true y hay error, retornar null
  if (opts.silent && !res.ok) {
    return null as unknown as T;
  }
  
  // Manejar respuestas de error del backend (con campo 'error' en lugar de 'success')
  if (!res.ok && raw && typeof raw === 'object') {
    const errorObj = raw as RawErrorShape;
    const hasStructured = Boolean(errorObj.error || errorObj.message || errorObj.mensaje || errorObj.details || errorObj.errors);
    if (hasStructured) {
      const details = asNonEmptyString(errorObj.details);
      const errs = extractValidationErrors(errorObj);
      const msg = resolveErrorMessage(res.status, errorObj);
      throw new ApiError(msg, res.status, details, errs);
    }
  }
  
  if (!isApiResponse<T>(raw)) {
    throw new ApiError(`HTTP ${res.status}`, res.status);
  }
  
  const api: ApiResponse<T> = raw;
  if (!res.ok || !api.success) {
    const anyRaw = raw as RawErrorShape;
    const details = asNonEmptyString(anyRaw.details);
    const errs = extractValidationErrors(anyRaw);

    const msg =
      // si el wrapper ApiResponse viene con message, usarlo como base
      typeof api.message === 'string' && api.message.trim()
        ? api.message.trim()
        : resolveErrorMessage(res.status, anyRaw);

    throw new ApiError(msg, res.status, details, errs);
  }
  if (typeof api.data === 'undefined') {
    return undefined as unknown as T;
  }
  return api.data as unknown as T;
}
