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
  constructor(message: string, status?: number, details?: string, errors?: ValidationErrorEntry[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.errors = errors;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}
