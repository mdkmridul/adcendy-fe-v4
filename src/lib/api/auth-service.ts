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
  async startSignup(email: string, password: string, name?: string) {
    return api.execute(() =>
      api.client.POST('/v1/auth/signup/start', {
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
  async refresh() {
    return api.execute(() =>
      api.client.POST('/v1/auth/refresh', {
        body: {},
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
      api.client.GET('/v1/auth/me', {})
    );
  },

  /**
   * Logout all sessions for the authenticated user.
   */
  async logoutAll() {
    return api.execute(() =>
      api.client.POST('/v1/auth/logout-all', { body: {} })
    );
  },
};
