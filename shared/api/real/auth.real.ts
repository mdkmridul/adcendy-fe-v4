import { http, refreshSession } from '../http';
import type { components } from '@/src/generated/openapi';

type LoginRequest = components['schemas']['LoginRequest'];
type SignupRequest = components['schemas']['SignupStartRequest'];
type AuthSession = components['schemas']['AuthSession'];
type AuthUser = components['schemas']['AuthUser'];
type SignupStartData = components['schemas']['SignupStartEnvelope']['data'];
type ProtectedData = components['schemas']['ProtectedEnvelope']['data'];

interface ApiResponse<T> {
  success: true;
  data: T;
  meta: components['schemas']['ResponseMeta'];
}

export const authRealAdapter = {
  login: async (payload: LoginRequest): Promise<AuthSession> => {
    const response = await http<ApiResponse<AuthSession>>('/v1/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    });
    return response.data;
  },

  signupStart: async (payload: SignupRequest): Promise<SignupStartData> => {
    const response = await http<ApiResponse<SignupStartData>>(
      '/v1/auth/signup/start',
      {
        method: 'POST',
        body: payload,
        skipAuth: true,
      },
    );
    return response.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await http<ApiResponse<AuthUser>>('/v1/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await http<ApiResponse<{ loggedOut: true }>>('/v1/auth/logout', {
      method: 'POST',
      body: {},
    });
  },

  logoutAll: async (): Promise<void> => {
    await http<ApiResponse<{ loggedOut: true }>>('/v1/auth/logout-all', {
      method: 'POST',
      body: {},
    });
  },

  refreshSession: async (): Promise<AuthSession> => {
    const result = await refreshSession();
    if (!result.ok) throw new Error(result.message);
    return result.session;
  },

  verifyReviewerAccess: async (): Promise<boolean> => {
    const response = await http<ApiResponse<ProtectedData>>(
      '/v1/auth/protected/reviewer',
    );
    return response.data.ok;
  },

  verifyAdminAccess: async (): Promise<boolean> => {
    const response = await http<ApiResponse<ProtectedData>>(
      '/v1/auth/protected/admin',
    );
    return response.data.ok;
  },
};
