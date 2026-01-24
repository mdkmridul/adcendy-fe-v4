'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '@/shared/components/layout/AppShell';
import { getToken, getUser } from '@/features/auth/auth';
import { canAccessPath } from '@/features/auth/rbac';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        router.push(`/auth/login?returnTo=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check if user has access to current path
      if (!canAccessPath(user, pathname)) {
        router.push('/app/unauthorized');
        setIsLoading(false);
        return;
      }

      setIsAuthed(true);
      setIsAuthorized(true);
      setIsLoading(false);
    };

    // Check auth on mount and pathname change
    checkAuth();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthed || !isAuthorized) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
