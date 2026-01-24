import type { AuthUser } from '@/features/auth/types';
import type { components } from '@/src/generated/openapi';

// Use generated OpenAPI types
export type LoginRequest = components['schemas']['LoginDto'];
export type SignupRequest = components['schemas']['RegisterDto'];
export type AuthResponse = components['schemas']['AuthSessionDto'];

/**
 * Mock Auth Adapter
 * Simulates authentication without calling real API
 */
export const authMockAdapter = {
  /**
   * Mock login - generates fake JWT token
   */
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Determine role based on email for testing
    let role: AuthUser['role'] = 'CLIENT';
    if (payload.email.includes('reviewer')) {
      role = 'REVIEWER';
    } else if (payload.email.includes('admin')) {
      role = 'ADMIN';
    }

    const mockUser: AuthResponse['user'] = {
      id: `user-${Date.now()}`,
      email: payload.email,
      role,
      createdAt: new Date().toISOString(),
    };

    const mockToken = `mock.${role}.${Date.now()}`;
    const mockRefreshToken = `mock.refresh.${Date.now()}`;

    return {
      accessToken: mockToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    };
  },

  /**
   * Mock signup - creates new CLIENT user
   */
  signup: async (payload: SignupRequest): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const mockUser: AuthResponse['user'] = {
      id: `user-${Date.now()}`,
      email: payload.email,
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };

    const mockToken = `mock.CLIENT.${Date.now()}`;
    const mockRefreshToken = `mock.refresh.${Date.now()}`;

    return {
      accessToken: mockToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    };
  },

  /**
   * Mock get current user
   */
  getMe: async (): Promise<AuthUser> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return mock user (in real app, this would validate token)
    return {
      id: `user-${Date.now()}`,
      email: 'user@adcendy.com',
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Mock logout
   */
  logout: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    // In mock mode, just resolve
  },

  /**
   * Mock refresh token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockUser: AuthResponse['user'] = {
      id: `user-${Date.now()}`,
      email: 'user@adcendy.com',
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };

    const mockToken = `mock.CLIENT.${Date.now()}`;
    const mockRefreshToken = `mock.refresh.${Date.now()}`;

    return {
      accessToken: mockToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    };
  },
};
