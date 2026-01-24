/**
 * Auth Service - Real typed implementation using generated OpenAPI types
 * 
 * This demonstrates the typed API client working with your actual backend
 */

import { api } from './index';

export const authService = {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string) {
    return api.execute(() =>
      api.client.POST('/v1/auth/register', {
        body: { email, password, name },
      })
    );
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    return api.execute(() =>
      api.client.POST('/v1/auth/login', {
        body: { email, password },
      })
    );
  },

  /**
   * Refresh authentication token
   */
  async refresh(refreshToken: string) {
    return api.execute(() =>
      api.client.POST('/v1/auth/refresh', {
        body: { refreshToken },
      })
    );
  },

  /**
   * Logout current user
   */
  async logout() {
    return api.execute(() =>
      api.client.POST('/v1/auth/logout', {})
    );
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return api.execute(() =>
      api.client.GET('/v1/auth/protected/me', {})
    );
  },

  /**
   * Get current user from /v1/users/me endpoint
   */
  async getMe() {
    return api.execute(() =>
      api.client.GET('/v1/users/me', {})
    );
  },
};
