'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/features/auth/auth';
import { canAccessPath } from '@/features/auth/rbac';
import type { Role } from '@/features/auth/types';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const router = useRouter();
  const user = getUser();

  React.useEffect(() => {
    if (!user) {
      const returnTo = window.location.pathname;
      router.push(`/auth/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }

    const currentPath = window.location.pathname;
    if (!canAccessPath(user, currentPath)) {
      router.push('/app/unauthorized');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
