'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '@/shared/components/layout/AppShell';
import { clearAuth, getToken, getUser } from '@/features/auth/auth';
import { canAccessPath, getRequiredRoleForPath } from '@/features/auth/rbac';
import { authRepository } from '@/shared/api/repositories';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const checkAuth = async () => {
      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!canAccessPath(user, pathname)) {
        router.push('/app/unauthorized');
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
          setIsLoading(false);
        }
      } catch {
        clearAuth();
        if (!isCancelled) {
          router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    };

    setIsLoading(true);
    void checkAuth();

    const handleAuthChange = () => {
      void checkAuth();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      isCancelled = true;
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [router, pathname]);

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
