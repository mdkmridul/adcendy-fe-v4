'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { clearAuth, getToken, getUser } from '@/features/auth/auth';
import type { AuthUser } from '@/features/auth/types';

type AuthStatus = 'loading' | 'anon' | 'authed';

/**
 * Lightweight client-side auth hook for marketing UI assessments.
 */
export function useMarketingAuth() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUserState] = useState<AuthUser | undefined>();

  useEffect(() => {
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

  const logout = useCallback(() => {
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
