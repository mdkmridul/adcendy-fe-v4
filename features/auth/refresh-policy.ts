export type RefreshFailureKind = 'anonymous' | 'retryable' | 'forbidden';

const ANONYMOUS_REFRESH_CODES = new Set([
  'AUTHENTICATION_REQUIRED',
  'INVALID_REFRESH_TOKEN',
  'REFRESH_TOKEN_EXPIRED',
  'REFRESH_TOKEN_REUSED',
  'SESSION_REVOKED',
  'SESSION_FAMILY_REVOKED',
  'ACCOUNT_DISABLED',
]);

export function classifyRefreshFailure(
  status: number | undefined,
  errorCode: string | undefined,
): RefreshFailureKind {
  if (errorCode === 'ORIGIN_NOT_ALLOWED' || status === 403) {
    return 'forbidden';
  }

  if (
    (errorCode && ANONYMOUS_REFRESH_CODES.has(errorCode)) ||
    status === 400 ||
    status === 401
  ) {
    return 'anonymous';
  }

  return 'retryable';
}

export function shouldRetryRefresh(
  attempt: number,
  status: number | undefined,
  errorCode: string | undefined,
  maximumRetries = 2,
): boolean {
  return (
    attempt < maximumRetries &&
    status === 409 &&
    errorCode === 'REFRESH_IN_PROGRESS'
  );
}
