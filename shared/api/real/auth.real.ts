import { http } from '../http';
import type { components } from '@/src/generated/openapi';

// Use generated OpenAPI types
type LoginRequest = components['schemas']['LoginDto'];
type SignupRequest = components['schemas']['RegisterDto'];
type AuthResponse = components['schemas']['AuthSessionDto'];
type AuthUser = components['schemas']['AuthUserDto'];

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
    return await http<AuthResponse>(
      '/v1/auth/login',
      {
        method: 'POST',
        body: payload,
        skipAuth: true, // Login doesn't require auth token
      }
    );
  },

  /**
   * Signup new user via API
   * POST /v1/auth/register
   */
  signup: async (payload: SignupRequest): Promise<AuthResponse> => {
    return await http<AuthResponse>(
      '/v1/auth/register',
      {
        method: 'POST',
        body: payload,
        skipAuth: true, // Signup doesn't require auth token
      }
    );
  },

  /**
   * Get current authenticated user
   * GET /v1/auth/protected/me
   */
  getMe: async (): Promise<AuthUser> => {
    return await http<AuthUser>('/v1/auth/protected/me', {
      method: 'GET',
    });
  },

  /**
   * Logout current user
   * POST /v1/auth/logout
   */
  logout: async (): Promise<void> => {
    await http<void>('/v1/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Refresh access token
   * POST /v1/auth/refresh
   */
  refreshToken: async (): Promise<AuthResponse> => {
    return await http<AuthResponse>(
      '/v1/auth/refresh',
      {
        method: 'POST',
      }
    );
  },
};
