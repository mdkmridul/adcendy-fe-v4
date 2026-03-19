import type { components } from '@/src/generated/openapi';
import type { LoginRequest, SignupRequest, AuthResponse } from '../mock/auth.mock';
import { authMockAdapter } from '../mock/auth.mock';
import { authRealAdapter } from '../real/auth.real';
import ENV from '@/lib/env';

// Use OpenAPI generated types
type AuthUser = components['schemas']['AuthUserDto'];

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = ENV.API.isMock ? authMockAdapter : authRealAdapter;

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Auth Repository] Using adapter:', ENV.API.dataSource);
}

/**
 * Auth Repository
 * Provides authentication operations with automatic mock/real switching
 */
export const authRepository = {
  /**
   * Login user
   * @param payload - Email and password
   * @returns Access token and user data
   */
  login: async (payload: LoginRequest): Promise<AuthResponse> => adapter.login(payload),

  /**
   * Signup new user
   * @param payload - Name, email, and password
   * @returns Access token and user data
   */
  signup: async (payload: SignupRequest): Promise<AuthResponse> => adapter.signup(payload),

  /**
   * Get current authenticated user
   * @returns Current user data
   */
  getMe: async (): Promise<AuthUser> => adapter.getMe(),

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => adapter.logout(),

  /**
   * Refresh access token
   * @returns New access token and user data
   */
  refreshToken: async (): Promise<AuthResponse> => adapter.refreshToken(),

  /**
   * Verify reviewer-protected access with the backend.
   */
  verifyReviewerAccess: async (): Promise<boolean> => adapter.verifyReviewerAccess(),

  /**
   * Verify admin-protected access with the backend.
   */
  verifyAdminAccess: async (): Promise<boolean> => adapter.verifyAdminAccess(),
};
