'use client';

import type { components } from '@/src/generated/openapi';
import { makeRequestId } from './requestId';
import { ApiError, normalizeError } from './errors';
import {
  clearAuth,
  getToken,
  setAuthSession,
} from '@/features/auth/auth';
import {
  classifyRefreshFailure,
  shouldRetryRefresh,
  type RefreshFailureKind,
} from '@/features/auth/refresh-policy';
import { parseRetryAfterMs } from '@/shared/run/retry-after';
import { shouldReplayAfterAuthRefresh } from './auth-replay-policy';

export { parseRetryAfterMs } from '@/shared/run/retry-after';
export { shouldReplayAfterAuthRefresh } from './auth-replay-policy';

type AuthSession = components['schemas']['AuthSession'];
type ErrorEnvelope = components['schemas']['ErrorEnvelope'];

export type RefreshSessionResult =
  | { ok: true; session: AuthSession }
  | {
      ok: false;
      kind: RefreshFailureKind;
      status?: number;
      errorCode?: string;
      message: string;
    };

let refreshPromise: Promise<RefreshSessionResult> | null = null;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const value = payload as Record<string, unknown>;
  const nested = value.error;

  if (typeof value.errorCode === 'string') return value.errorCode;
  if (typeof value.code === 'string') return value.code;
  if (nested && typeof nested === 'object') {
    const nestedValue = nested as Record<string, unknown>;
    if (typeof nestedValue.errorCode === 'string') return nestedValue.errorCode;
    if (typeof nestedValue.code === 'string') return nestedValue.code;
  }

  return undefined;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const value = payload as Record<string, unknown>;
  const nested = value.error;

  if (typeof value.message === 'string') return value.message;
  if (nested && typeof nested === 'object') {
    const nestedValue = nested as Record<string, unknown>;
    if (typeof nestedValue.message === 'string') return nestedValue.message;
  }
  if (typeof nested === 'string') return nested;

  return fallback;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

async function performRefresh(): Promise<RefreshSessionResult> {
  const retryDelays = [200, 500];

  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    try {
      const response = await fetch('/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Request-Id': makeRequestId(),
        },
      });
      const payload = await readJsonSafely(response);

      if (response.ok) {
        const session = (
          payload as { data?: AuthSession } | undefined
        )?.data;

        if (session?.accessToken && session.user) {
          setAuthSession(session, { broadcast: false });
          return { ok: true, session };
        }

        clearAuth({ broadcast: false });
        return {
          ok: false,
          kind: 'anonymous',
          status: response.status,
          errorCode: 'INVALID_REFRESH_RESPONSE',
          message: 'The session refresh response was incomplete.',
        };
      }

      const errorCode = getErrorCode(payload);
      if (
        shouldRetryRefresh(
          attempt,
          response.status,
          errorCode,
          retryDelays.length,
        )
      ) {
        await wait(retryDelays[attempt]);
        continue;
      }

      const kind = classifyRefreshFailure(response.status, errorCode);
      if (kind !== 'retryable') {
        clearAuth({ broadcast: false });
      }

      return {
        ok: false,
        kind,
        status: response.status,
        errorCode,
        message: getErrorMessage(
          payload,
          kind === 'retryable'
            ? 'Session refresh is temporarily unavailable.'
            : 'Your session has ended. Please sign in again.',
        ),
      };
    } catch {
      return {
        ok: false,
        kind: 'retryable',
        errorCode: 'NETWORK_ERROR',
        message: 'Session refresh is temporarily unavailable.',
      };
    }
  }

  return {
    ok: false,
    kind: 'retryable',
    status: 409,
    errorCode: 'REFRESH_IN_PROGRESS',
    message: 'Another session refresh is still in progress.',
  };
}

/**
 * Rotate the Backend-owned refresh cookie and replace the in-memory access
 * token. Concurrent callers in this tab share one request.
 */
export async function refreshSession(): Promise<RefreshSessionResult> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  responseType?: 'auto' | 'json' | 'blob' | 'text' | 'arrayBuffer';
  signal?: AbortSignal;
  /**
   * Opts a mutation into one replay after a successful access-token refresh.
   * Prefer a stable Idempotency-Key header; this flag is only for operations
   * whose Backend contract guarantees replay safety without one.
   */
  allowAuthReplay?: boolean;
}

export interface HttpRawResponse<T> {
  data: T;
  headers: Headers;
  status: number;
  contentType: string | null;
}

async function performRequest(
  url: string,
  method: NonNullable<HttpOptions['method']>,
  headers: Record<string, string>,
  body: unknown,
  signal?: AbortSignal,
) {
  return fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
}

async function parseSuccessResponse<T>(
  response: Response,
  responseType: NonNullable<HttpOptions['responseType']>,
): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (response.status === 204) return undefined as T;
  if (responseType === 'blob') return (await response.blob()) as T;
  if (responseType === 'text') return (await response.text()) as T;
  if (responseType === 'arrayBuffer') {
    return (await response.arrayBuffer()) as T;
  }

  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  if (responseType === 'json') {
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  return undefined as T;
}

async function parseErrorResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) return readJsonSafely(response);

  const text = await response.text();
  return { message: text || response.statusText };
}

function createResponseError(
  response: Response,
  payload: unknown,
  requestId: string,
): ApiError {
  const error = normalizeError(
    getErrorMessage(payload, response.statusText || 'API Error'),
    response.status,
    requestId,
  );
  error.code = getErrorCode(payload);
  error.details =
    (payload as Partial<ErrorEnvelope> | undefined)?.details ?? payload;
  error.retryAfterMs = parseRetryAfterMs(response.headers.get('Retry-After'));

  if (response.status === 409) {
    error.data =
      (payload as { data?: unknown } | undefined)?.data ?? payload;
  }

  return error;
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (!window.location.pathname.startsWith('/auth/')) {
    window.location.href = `/auth/login?next=${encodeURIComponent(currentPath)}`;
  }
}

export async function httpRaw<T>(
  path: string,
  options: HttpOptions = {},
): Promise<HttpRawResponse<T>> {
  const {
    method = 'GET',
    body,
    query,
    headers = {},
    skipAuth = false,
    responseType = 'auto',
    signal,
    allowAuthReplay = false,
  } = options;
  const requestId = makeRequestId();

  let url = path;
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
    ...headers,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    let response = await performRequest(url, method, finalHeaders, body, signal);

    if (
      response.status === 401 &&
      !skipAuth &&
      path !== '/v1/auth/refresh'
    ) {
      const refreshResult = await refreshSession();

      if (refreshResult.ok) {
        if (
          shouldReplayAfterAuthRefresh(
            method,
            finalHeaders,
            allowAuthReplay,
          )
        ) {
          finalHeaders.Authorization = `Bearer ${refreshResult.session.accessToken}`;
          response = await performRequest(url, method, finalHeaders, body, signal);
        }
      } else {
        const error = normalizeError(
          refreshResult.message,
          refreshResult.status,
          requestId,
        );
        error.code = refreshResult.errorCode;

        if (refreshResult.kind === 'anonymous') {
          redirectToLogin();
        }

        throw error;
      }
    }

    if (!response.ok) {
      throw createResponseError(
        response,
        await parseErrorResponse(response),
        requestId,
      );
    }

    return {
      data: await parseSuccessResponse<T>(response, responseType),
      headers: response.headers,
      status: response.status,
      contentType: response.headers.get('content-type'),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeError(error, undefined, requestId);
  }
}

export async function http<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  return (await httpRaw<T>(path, options)).data;
}
