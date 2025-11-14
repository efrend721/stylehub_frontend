import { API_BASE, createHeaders, isApiResponse, ApiResponse } from '#/services/common/types';
import { ApiError } from './errors';

export interface RequestOptions {
  token?: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
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
      body: body !== undefined ? JSON.stringify(body) : undefined
    }
  ];
  const res = await fetch(input, init);
  const raw = await parseJsonSafe(res);
  if (!isApiResponse<T>(raw)) {
    throw new ApiError(`HTTP ${res.status}`, res.status);
  }
  const api: ApiResponse<T> = raw; // after guard raw is ApiResponse<T>
  if (!res.ok || !api.success) {
    const msg = api.message ? String(api.message) : `HTTP ${res.status}`;
    throw new ApiError(msg, res.status);
  }
  if (typeof api.data === 'undefined') {
    return undefined as unknown as T;
  }
  return api.data as unknown as T;
}
