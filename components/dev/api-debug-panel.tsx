'use client';

/**
 * API Debug Panel
 * 
 * A developer tool that displays API configuration and request status.
 * Only shown in development/staging when NEXT_PUBLIC_ENABLE_DEBUG_PANEL=true
 * 
 * Features:
 * - Shows current API base URL and data source
 * - Displays authentication state
 * - Tracks last API request/response
 * - Allows toggling between mock/real (requires page reload)
 */

import { useState, useEffect } from 'react';
import { getToken, getUser, isAuthenticated } from '@/features/auth/auth';
import ENV from '@/lib/env';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ApiDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [authState, setAuthState] = useState({
    isAuth: false,
    hasToken: false,
    user: null as any,
  });

  // Check if debug panel should be shown
  const shouldShow = ENV.features.debugPanel && !ENV.isProduction;

  useEffect(() => {
    if (!shouldShow) return;

    const updateAuthState = () => {
      setAuthState({
        isAuth: isAuthenticated(),
        hasToken: !!getToken(),
        user: getUser(),
      });
    };

    updateAuthState();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => updateAuthState();
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 transition-colors"
        title="API Debug Panel"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-96 p-4 shadow-2xl bg-white dark:bg-gray-900 border">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">🔧 API Debug</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Environment */}
            <div>
              <h4 className="text-sm font-medium mb-2">Environment</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">NODE_ENV:</span>
                  <Badge variant={ENV.isProduction ? 'default' : 'secondary'}>
                    {ENV.NODE_ENV}
                  </Badge>
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div>
              <h4 className="text-sm font-medium mb-2">API Configuration</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base URL:</span>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    {ENV.API.baseURL}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data Source:</span>
                  <Badge
                    variant={ENV.API.isReal ? 'default' : 'outline'}
                    className={ENV.API.isReal ? 'bg-green-600' : 'bg-orange-600'}
                  >
                    {ENV.API.dataSource.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Auth State */}
            <div>
              <h4 className="text-sm font-medium mb-2">Authentication</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={authState.isAuth ? 'default' : 'secondary'}>
                    {authState.isAuth ? '✓ Authenticated' : '✗ Not authenticated'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Token:</span>
                  <span>{authState.hasToken ? '✓' : '✗'}</span>
                </div>
                {authState.user && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                    <div>Email: {authState.user.email}</div>
                    <div>Role: {authState.user.role}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature Flags */}
            <div>
              <h4 className="text-sm font-medium mb-2">Feature Flags</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Logging:</span>
                  <span>{ENV.features.apiLogging ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Debug Panel:</span>
                  <span>{ENV.features.debugPanel ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t space-y-2">
              <Button
                onClick={() => {
                  console.group('🔧 Environment Configuration');
                  console.log('NODE_ENV:', ENV.NODE_ENV);
                  console.log('API Base URL:', ENV.API.baseURL);
                  console.log('Data Source:', ENV.API.dataSource);
                  console.log('Auth State:', authState);
                  console.groupEnd();
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Log Config to Console
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                To switch data source, set NEXT_PUBLIC_DATA_SOURCE
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
