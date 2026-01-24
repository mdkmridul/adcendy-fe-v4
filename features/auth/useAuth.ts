'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, getUser, setUser, clearAuth } from './auth';
import type { AuthUser, Role } from './types';

export function useAuth() {
  const router = useRouter();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize from storage on mount
    const storedToken = getToken();
    const storedUser = getUser();
    setTokenState(storedToken);
    setUserState(storedUser);
    setIsLoading(false);
  }, []);

  const loginMock = (role: Role) => {
    const mockToken = `mock.${role}.${Date.now()}`;
    const mockUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: `${role.toLowerCase()}@adcendy.com`,
      name: role === 'CLIENT' ? 'Demo User' : role === 'REVIEWER' ? 'Reviewer' : 'Administrator',
      role,
    };

    setToken(mockToken);
    setUser(mockUser);
    setTokenState(mockToken);
    setUserState(mockUser);
  };

  const logout = () => {
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
    const token = getToken();
    if (!token) {
      const returnTo = window.location.pathname + window.location.search;
      router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
    setIsLoading(false);
  }, [router]);

  return isLoading;
}

export function useIsAuthenticated() {
  return getToken() !== null && getUser() !== null;
}
