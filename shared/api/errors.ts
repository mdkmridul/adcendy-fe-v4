export type ApiErrorKind =
  | 'Auth'
  | 'Forbidden'
  | 'RateLimit'
  | 'NotFound'
  | 'Validation'
  | 'Server'
  | 'Network'
  | 'Unknown';

export interface ApiErrorResponse {
  kind: ApiErrorKind;
  status?: number;
  message: string;
  requestId?: string;
  details?: any;
}

export class ApiError extends Error implements ApiErrorResponse {
  kind: ApiErrorKind;
  status?: number;
  requestId?: string;
  details?: any;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.kind = response.kind;
    this.status = response.status;
    this.requestId = response.requestId;
    this.details = response.details;
  }
}

export function normalizeError(
  error: unknown,
  status?: number,
  requestId?: string,
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      kind: 'Unknown',
      message: error.message,
      requestId,
    });
  }

  const message = String(error) || 'Unknown error';
  const kind: ApiErrorKind =
    status === 401
      ? 'Auth'
      : status === 403
        ? 'Forbidden'
        : status === 404
          ? 'NotFound'
          : status === 409 || status === 422
            ? 'Validation'
            : status === 429
              ? 'RateLimit'
              : status && status >= 500
                ? 'Server'
                : 'Unknown';

  return new ApiError({
    kind,
    status,
    message,
    requestId,
  });
}
