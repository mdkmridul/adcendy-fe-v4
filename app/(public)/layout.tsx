'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { IntelligenceStreamNav } from '@/features/landing/components/IntelligenceStreamNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth') || pathname?.startsWith('/admin/login');

  if (isAuthRoute) {
    return (
      <div className="adcendy-cinematic min-h-screen">
        <IntelligenceStreamNav />
        {children}
      </div>
    );
  }

  return <div className="adcendy-cinematic min-h-screen">{children}</div>;
}
