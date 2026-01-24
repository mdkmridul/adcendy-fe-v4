'use client';

import { makeRequestId } from './requestId';
import { ApiError, normalizeError } from './errors';
import { getToken } from '@/features/auth/auth';
import ENV from '@/lib/env';

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function http<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    query,
    headers = {},
    skipAuth = false,
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
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (!response.ok) {
      data = { message: response.statusText };
    }

    // Handle errors
    if (!response.ok) {
      const error = normalizeError(data?.message || 'API Error', response.status, requestId);
      error.details = data?.details || data;
      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error
    throw normalizeError(error, undefined, requestId);
  }
}
