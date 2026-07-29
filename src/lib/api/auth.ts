/**
 * Auth API - Typed authentication endpoints using generated OpenAPI types
 * 
 * This module provides typed wrappers around all authentication endpoints:
 * - Two-step signup with OTP verification
 * - Login
 * - Password reset flow (forgot password + reset with OTP)
 * - Token refresh and logout
 * 
 * All types are generated from backend OpenAPI spec - DO NOT define custom types.
 */

import { api } from './client';
import type { components } from '@/src/generated/openapi';

// Import types directly from OpenAPI schema
type SignupStartDto = components['schemas']['SignupStartRequest'];
type SignupVerifyDto = components['schemas']['SignupVerifyRequest'];
type LoginDto = components['schemas']['LoginRequest'];
type ForgotPasswordDto = components['schemas']['ForgotPasswordRequest'];
type PasswordResetDto = components['schemas']['PasswordResetRequest'];

/**
 * Unwrap API response { success, data, meta } structure
 */
function unwrapData<T>(response: { success: boolean; data: T; meta: any }): T {
  return response.data;
}

export const authApi = {
  /**
   * Step 1 of signup: Start signup process and request OTP
   * POST /v1/auth/signup/start
   * 
   * @param payload - Email, password, and optional name
   * @returns Verification ID and expiry time for OTP verification
   */
  async signupStart(payload: SignupStartDto) {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/signup/start', {
        body: payload,
      })
    );
    return unwrapData(result);
  },

  /**
   * Step 2 of signup: Verify OTP and complete signup
   * POST /v1/auth/signup/verify
   * 
   * @param payload - Verification ID and OTP code
   * @returns Access token plus the database-derived user. The refresh token is
   * stored only in the Backend's HttpOnly cookie.
   */
  async signupVerify(payload: SignupVerifyDto) {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/signup/verify', {
        body: payload,
      })
    );
    return unwrapData(result);
  },

  /**
   * Login with email and password
   * POST /v1/auth/login
   * 
   * @param payload - Email and password
   * @returns Access token plus the database-derived user. The refresh token is
   * stored only in the Backend's HttpOnly cookie.
   */
  async login(payload: LoginDto) {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/login', {
        body: payload,
      })
    );
    return unwrapData(result);
  },

  /**
   * Step 1 of password reset: Request password reset OTP
   * POST /v1/auth/password/forgot
   * 
   * @param payload - Email address
   * @returns Reset ID and expiry time for password reset
   */
  async forgotPassword(payload: ForgotPasswordDto) {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/password/forgot', {
        body: payload,
      })
    );
    return unwrapData(result);
  },

  /**
   * Step 2 of password reset: Verify OTP and set new password
   * POST /v1/auth/password/reset
   * 
   * @param payload - Reset ID, OTP, and new password
   * @returns Success confirmation
   */
  async resetPassword(payload: PasswordResetDto) {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/password/reset', {
        body: payload,
      })
    );
    return unwrapData(result);
  },

  /**
   * Rotate the HttpOnly refresh cookie and return a new in-memory session.
   * POST /v1/auth/refresh
   */
  async refresh() {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/refresh', {
        body: {},
      })
    );
    return unwrapData(result);
  },

  /**
   * Logout current user
   * POST /v1/auth/logout
   */
  async logout() {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/logout', {})
    );
    return unwrapData(result);
  },

  /**
   * Logout every session for the authenticated user.
   * POST /v1/auth/logout-all
   */
  async logoutAll() {
    const result = await api.execute(() =>
      api.client.POST('/v1/auth/logout-all', {
        body: {},
      })
    );
    return unwrapData(result);
  },

  /**
   * Get current authenticated user.
   * GET /v1/auth/me
   */
  async getMe() {
    const result = await api.execute(() =>
      api.client.GET('/v1/auth/me', {})
    );
    return unwrapData(result);
  },
};

export default authApi;
