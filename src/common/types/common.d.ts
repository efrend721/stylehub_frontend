export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}