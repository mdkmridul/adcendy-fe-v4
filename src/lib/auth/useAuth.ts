'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { clearAuth, getToken, getUser } from '@/features/auth/auth';
import type { AuthUser } from '@/features/auth/types';

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

  // Check on mount
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Listen for auth changes (storage events from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adcendy_token' || e.key === 'adcendy_user') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthState]);

  // Custom event listener for same-tab auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [checkAuthState]);

  const logout = useCallback(() => {
    clearAuth();
    setStatus('anon');
    setUserState(undefined);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  }, [router]);

  return {
    status,
    user,
    logout,
  } as const;
}
