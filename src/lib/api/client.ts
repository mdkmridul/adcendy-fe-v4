/**
 * Typed API Client
 * 
 * This module provides a type-safe API client using openapi-fetch
 * and types generated from the backend OpenAPI specification.
 * 
 * Features:
 * - Full TypeScript type safety for requests and responses
 * - Automatic Bearer token authentication
 * - Request ID tracking for debugging
 * - Consistent error handling and normalization
 * - Request/response logging in development
 */

import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '../../generated/openapi';
import { getToken } from '@/features/auth/auth';
import { makeRequestId } from '@/shared/api/requestId';
import { normalizeError, ApiError } from '@/shared/api/errors';
import ENV from '@/lib/env';

/**
 * Normalized API error response structure
 * Used consistently across the application for error handling
 */
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: any;
  requestId?: string;
}

/**
 * Create the typed API client with openapi-fetch
 */
function createTypedClient() {
  const client = createClient<paths>({
    baseUrl: '',
    credentials: 'include',
  });

  // Middleware: Add authentication and request ID headers
  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      const requestId = makeRequestId();
      request.headers.set('X-Request-Id', requestId);

      // Add Bearer token if available
      const token = getToken();
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }

      // Log request in development
      if (ENV.features.apiLogging) {
        console.log('[API Request]', {
          method: request.method,
          url: request.url,
          requestId,
          hasAuth: !!token,
        });
      }

      return request;
    },

    async onResponse({ response, request }) {
      // Log response in development
      if (ENV.features.apiLogging) {
        const requestId = request.headers.get('X-Request-Id');
        console.log('[API Response]', {
          status: response.status,
          url: request.url,
          requestId,
        });
      }

      return response;
    },
  };

  client.use(authMiddleware);

  return client;
}

/**
 * Singleton typed API client instance
 */
export const apiClient = createTypedClient();

/**
 * Normalize API error into consistent format
 * 
 * @param error - Error from API call
 * @param requestId - Optional request ID for tracking
 * @returns Normalized error response
 */
export function normalizeApiError(
  error: any,
  requestId?: string
): ApiErrorResponse {
  // Already an ApiError
  if (error instanceof ApiError) {
    return {
      status: error.status || 500,
      code: error.code || error.kind || 'UNKNOWN_ERROR',
      message: error.message,
      details: error.details,
      requestId: error.requestId || requestId,
    };
  }

  // openapi-fetch error format
  if (error?.response) {
    const status = error.response.status || 500;
    const data = error.data || {};
    
    return {
      status,
      code: data.code || data.error || `HTTP_${status}`,
      message: data.message || data.error_description || error.response.statusText || 'API request failed',
      details: data.details || data,
      requestId,
    };
  }

  if (error?.errorCode || error?.statusCode) {
    return {
      status: error.statusCode || 500,
      code: error.errorCode || 'UNKNOWN_ERROR',
      message: error.message || 'API request failed',
      details: error.details,
      requestId: error.requestId || requestId,
    };
  }

  // Network or unknown error
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: error?.message || 'Network request failed',
    details: error,
    requestId,
  };
}

/**
 * Helper to execute API call with error handling
 * 
 * @param call - API client call function
 * @returns Promise with typed response data or throws normalized error
 */
export async function executeApiCall<T>(
  call: () => Promise<{ data?: T; error?: any; response: Response }>
): Promise<T> {
  try {
    const { data, error, response } = await call();

    if (error) {
      const requestId = response.headers.get('X-Request-Id') || undefined;
      const normalizedError = normalizeApiError(error, requestId);
      
      // Log error in development
      if (ENV.features.apiLogging) {
        console.error('[API Error]', normalizedError);
      }

      throw normalizedError;
    }

    if (!data) {
      throw normalizeApiError(
        new Error('No data returned from API'),
        response.headers.get('X-Request-Id') || undefined
      );
    }

    return data;
  } catch (error) {
    // If already normalized, re-throw
    if ((error as any).code && (error as any).status !== undefined) {
      throw error;
    }

    // Otherwise normalize and throw
    throw normalizeApiError(error);
  }
}

/**
 * Type-safe API client with helper methods
 * Re-export for convenient access
 */
export const api = {
  client: apiClient,
  execute: executeApiCall,
  normalizeError: normalizeApiError,
} as const;

export default api;
