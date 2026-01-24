import { http } from '../http';
import type { components } from '@/src/generated/openapi';

// Use generated OpenAPI types
type LoginRequest = components['schemas']['LoginDto'];
type SignupRequest = components['schemas']['RegisterDto'];
type AuthResponse = components['schemas']['AuthSessionDto'];
type AuthUser = components['schemas']['AuthUserDto'];

// API response wrapper structure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    requestId: Record<string, never> | null;
    timestamp: string;
  };
}

/**
 * Real Auth Adapter
 * Calls actual backend API endpoints for authentication
 */
export const authRealAdapter = {
  /**
   * Login user via API
   * POST /v1/auth/login
   */
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await http<ApiResponse<AuthResponse>>(
      '/v1/auth/login',
      {
        method: 'POST',
        body: payload,
        skipAuth: true, // Login doesn't require auth token
      }
    );
    return response.data;
  },

  /**
   * Signup new user via API
   * POST /v1/auth/register
   */
  signup: async (payload: SignupRequest): Promise<AuthResponse> => {
    const response = await http<ApiResponse<AuthResponse>>(
      '/v1/auth/register',
      {
        method: 'POST',
        body: payload,
        skipAuth: true, // Signup doesn't require auth token
      }
    );
    return response.data;
  },

  /**
   * Get current authenticated user
   * GET /v1/auth/protected/me
   * Note: OpenAPI spec shows no content, but backend likely returns user
   */
  getMe: async (): Promise<AuthUser> => {
    // API may return wrapped response or direct user data
    const response = await http<AuthUser | ApiResponse<AuthUser>>('/v1/auth/protected/me', {
      method: 'GET',
    });
    // Handle both wrapped and unwrapped responses
    return 'data' in response ? response.data : response;
  },

  /**
   * Logout current user
   * POST /v1/auth/logout
   */
  logout: async (): Promise<void> => {
    await http<ApiResponse<{ success: boolean }>>('/v1/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Refresh access token
   * POST /v1/auth/refresh
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await http<ApiResponse<AuthResponse>>(
      '/v1/auth/refresh',
      {
        method: 'POST',
      }
    );
    return response.data;
  },
};
