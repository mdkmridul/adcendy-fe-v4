'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { clearAuth, getToken, getUser } from '@/features/auth/auth';
import type { AuthUser } from '@/features/auth/types';
import { refreshSession } from '@/shared/api/http';
import { authRepository } from '@/shared/api/repositories';

type AuthStatus = 'loading' | 'anon' | 'authed';

/**
 * Lightweight client-side auth hook for marketing UI assessments.
 * Automatically updates when auth state changes.
 */
export function useMarketingAuth() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUserState] = useState<AuthUser | undefined>();

  // Check auth state
  const checkAuthState = useCallback(() => {
    const token = getToken();
    const storedUser = getUser();
    if (token && storedUser) {
      setStatus('authed');
      setUserState(storedUser);
    } else {
      setStatus('anon');
      setUserState(undefined);
    }
  }, []);

  // Bootstrap from the Backend-owned HttpOnly refresh cookie on mount.
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!getToken() || !getUser()) {
        await refreshSession();
      }
      if (!cancelled) checkAuthState();
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [checkAuthState]);

  // Custom event listener for same-tab auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [checkAuthState]);

  const logout = useCallback(async () => {
    try {
      await authRepository.logout();
    } catch {
      // Clear the in-memory session even if Backend logout is unreachable.
    }
    clearAuth();
    setStatus('anon');
    setUserState(undefined);
    router.push('/');
  }, [router]);

  return {
    status,
    user,
    logout,
  } as const;
}
