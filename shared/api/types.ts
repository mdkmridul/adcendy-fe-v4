/**
 * API Response Wrapper Types
 * 
 * All API endpoints return responses wrapped in this structure
 */

export interface ApiResponseMeta {
  requestId: Record<string, never> | null;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: ApiResponseMeta;
}

/**
 * Helper to unwrap API response and extract data
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}
