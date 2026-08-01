'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { Toaster } from '@/components/ui/toaster';
import { initializeAuthSync } from '@/features/auth/auth';
import { refreshSession } from '@/shared/api/http';
import { useRuntimeConfigReady } from '@/shared/runtime-config/features';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function AuthSessionBootstrap() {
  useEffect(() => {
    const bootstrap = () => {
      void refreshSession();
    };
    const disconnectAuthSync = initializeAuthSync();

    bootstrap();
    window.addEventListener('auth-bootstrap-requested', bootstrap);

    return () => {
      window.removeEventListener('auth-bootstrap-requested', bootstrap);
      disconnectAuthSync();
    };
  }, []);

  return null;
}

function RuntimeConfigGate({ children }: { children: React.ReactNode }) {
  const runtimeConfigReady = useRuntimeConfigReady();

  if (!runtimeConfigReady) {
    return (
      <main className="flex min-h-screen items-center justify-center" role="status">
        Loading application configuration…
      </main>
    );
  }

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RuntimeConfigGate>
        <AuthSessionBootstrap />
        <SWRConfig
          value={{
            shouldRetryOnError: false,
            errorRetryCount: 0,
          }}
        >
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </SWRConfig>
      </RuntimeConfigGate>
    </ThemeProvider>
  );
}
