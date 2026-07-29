'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, getUser, setUser, clearAuth } from './auth';
import type { AuthUser, Role } from './types';
import { refreshSession } from '@/shared/api/http';
import { authRepository } from '@/shared/api/repositories';

export function useAuth() {
  const router = useRouter();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      let nextToken = getToken();
      let nextUser = getUser();

      if (!nextToken || !nextUser) {
        const result = await refreshSession();
        if (result.ok) {
          nextToken = result.session.accessToken;
          nextUser = result.session.user;
        }
      }

      if (!cancelled) {
        setTokenState(nextToken);
        setUserState(nextUser);
        setIsLoading(false);
      }
    };

    const handleAuthChange = () => {
      setTokenState(getToken());
      setUserState(getUser());
    };

    void syncSession();
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const loginMock = (role: Role) => {
    const mockToken = `mock.${role}.${Date.now()}`;
    const mockUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: `${role.toLowerCase()}@adcendy.com`,
      role,
      createdAt: new Date().toISOString(),
    };

    setToken(mockToken);
    setUser(mockUser);
    setTokenState(mockToken);
    setUserState(mockUser);
  };

  const logout = async () => {
    try {
      await authRepository.logout();
    } catch {
      // Local logout still completes when the network is unavailable.
    }
    clearAuth();
    setTokenState(null);
    setUserState(null);
    router.push('/auth/login');
  };

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    loginMock,
    logout,
  };
}

export function useAuthGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const guard = async () => {
      if (!getToken()) {
        const result = await refreshSession();
        if (!result.ok && result.kind === 'anonymous') {
          const returnTo = window.location.pathname + window.location.search;
          router.push(`/auth/login?next=${encodeURIComponent(returnTo)}`);
        }
      }

      if (!cancelled) setIsLoading(false);
    };

    void guard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return isLoading;
}

export function useIsAuthenticated() {
  return getToken() !== null && getUser() !== null;
}
