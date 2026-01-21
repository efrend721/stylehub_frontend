export type ValidationErrorEntry = {
  origin?: string;
  code?: string;
  path?: string[];
  message?: string;
  format?: string;
  pattern?: string | RegExp | null;
};

export class ApiError extends Error {
  status?: number;
  details?: string;
  errors?: ValidationErrorEntry[];
  source?: string;
  constructor(message: string, status?: number, details?: string, errors?: ValidationErrorEntry[], source?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.errors = errors;
    this.source = source;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}
