export type ID = string;
export type ISODateTime = string;

export type RunStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export type Role = 'CLIENT' | 'REVIEWER' | 'ADMIN';

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
