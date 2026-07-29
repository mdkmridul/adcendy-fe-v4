'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '@/shared/components/layout/AppShell';
import { clearAuth, getToken, getUser } from '@/features/auth/auth';
import { canAccessPath, getRequiredRoleForPath } from '@/features/auth/rbac';
import { authRepository } from '@/shared/api/repositories';
import { refreshSession } from '@/shared/api/http';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    let checkPromise: Promise<void> | null = null;

    const runAuthCheck = async () => {
      let token = getToken();
      let user = getUser();

      if (!token || !user) {
        const refreshResult = await refreshSession();

        if (!refreshResult.ok) {
          if (refreshResult.kind === 'anonymous') {
            router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
            return;
          }

          if (!isCancelled) {
            setSessionError(refreshResult.message);
            setIsLoading(false);
          }
          return;
        }

        token = refreshResult.session.accessToken;
        user = refreshResult.session.user;
      }

      if (!canAccessPath(user, pathname)) {
        router.replace('/app/unauthorized');
        return;
      }

      try {
        const requiredRole = getRequiredRoleForPath(pathname);

        if (requiredRole === 'ADMIN') {
          await authRepository.verifyAdminAccess();
        } else if (requiredRole === 'REVIEWER') {
          if (user.role === 'ADMIN') {
            await authRepository.verifyAdminAccess();
          } else {
            await authRepository.verifyReviewerAccess();
          }
        }

        if (!isCancelled) {
          setIsAuthed(true);
          setIsAuthorized(true);
          setSessionError(null);
          setIsLoading(false);
        }
      } catch (error) {
        const isTemporaryFailure =
          error instanceof ApiError &&
          (error.kind === 'Network' ||
            error.kind === 'RateLimit' ||
            error.kind === 'Server' ||
            error.status === undefined);

        if (isTemporaryFailure) {
          if (!isCancelled) {
            setSessionError('We could not verify your session. Please retry.');
            setIsLoading(false);
          }
          return;
        }

        clearAuth({ broadcast: false });
        if (!isCancelled) {
          router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    };

    const checkAuth = () => {
      if (!checkPromise) {
        checkPromise = runAuthCheck().finally(() => {
          checkPromise = null;
        });
      }
      return checkPromise;
    };

    setIsLoading(true);
    setSessionError(null);
    void checkAuth();

    const handleAuthChange = () => void checkAuth();
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      isCancelled = true;
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [router, pathname, retryKey]);

  if (sessionError) {
    return (
      <div className="adcendy-cinematic min-h-screen bg-background flex flex-col gap-4 items-center justify-center">
        <div className="text-sm text-muted-foreground">{sessionError}</div>
        <Button onClick={() => setRetryKey((value) => value + 1)}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="adcendy-cinematic min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthed || !isAuthorized) {
    return null;
  }

  return <div className="adcendy-cinematic"><AppShell>{children}</AppShell></div>;
}
