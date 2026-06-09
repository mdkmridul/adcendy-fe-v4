'use client';

import { makeRequestId } from './requestId';
import { ApiError, normalizeError } from './errors';
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from '@/features/auth/auth';
import ENV from '@/lib/env';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 * @returns New access token or null if refresh failed
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${ENV.API.baseURL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, clear auth and return null
        clearAuth();
        return null;
      }

      const data = await response.json();
      const newAccessToken = data?.data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken;

      if (newAccessToken && newRefreshToken) {
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        return newAccessToken;
      }

      clearAuth();
      return null;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      clearAuth();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  responseType?: 'auto' | 'json' | 'blob' | 'text' | 'arrayBuffer';
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
  body: any,
) {
  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function parseSuccessResponse<T>(
  response: Response,
  responseType: NonNullable<HttpOptions['responseType']>,
): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

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

async function parseErrorResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return {
    message: text || response.statusText,
  };
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
  } = options;

  const baseUrl = ENV.API.baseURL;
  const requestId = makeRequestId();

  // Build URL with query params
  let url = `${baseUrl}${path}`;
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  // Build headers
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
    ...headers,
  };

  // Add auth header if token exists and not skipped
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  try {
    let response = await performRequest(url, method, finalHeaders, body);

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !skipAuth) {
      if (ENV.features.apiLogging) {
        console.log('[API] 401 Unauthorized - attempting token refresh');
      }

      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry the request with the new token
        finalHeaders.Authorization = `Bearer ${newToken}`;

        response = await performRequest(url, method, finalHeaders, body);

        if (!response.ok) {
          const data = await parseErrorResponse(response);
          const errorMessage = data?.message || data?.error || data?.data?.message || response.statusText || 'API Error';
          const error = normalizeError(errorMessage, response.status, requestId);
          error.details = data?.details || data;
          throw error;
        }
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Don't redirect if already on auth pages
          if (!currentPath.startsWith('/auth/')) {
            window.location.href = `/auth/login?next=${encodeURIComponent(currentPath)}`;
          }
        }
        
        const error = normalizeError('Session expired. Please sign in again.', 401, requestId);
        throw error;
      }
    }

    // Handle other errors
    if (!response.ok) {
      const data = await parseErrorResponse(response);
      // Extract error message from various possible formats
      const errorMessage = data?.message || data?.error || data?.data?.message || response.statusText || 'API Error';
      const error = normalizeError(errorMessage, response.status, requestId);
      error.details = data?.details || data;
      // For 409 Conflict, preserve the full response data (contains latest draft)
      if (response.status === 409) {
        error.data = data?.data || data;
      }
      throw error;
    }

    return {
      data: await parseSuccessResponse<T>(response, responseType),
      headers: response.headers,
      status: response.status,
      contentType: response.headers.get('content-type'),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error
    throw normalizeError(error, undefined, requestId);
  }
}

export async function http<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const response = await httpRaw<T>(path, options);
  return response.data;
}
