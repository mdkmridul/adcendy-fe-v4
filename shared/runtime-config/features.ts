'use client';

import { useSyncExternalStore } from 'react';
import { getBrowserRuntimeConfig } from './types';

function subscribe(): () => void {
  return () => undefined;
}

function getLegacyPerformanceSnapshot(): boolean {
  return (
    getBrowserRuntimeConfig()?.FEATURE_FLAGS.legacyPerformanceWorkspaces ===
    true
  );
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Legacy weekly/anomaly/tweak workspaces are outside the first UAT contract
 * baseline. They remain available for local contract work only when the
 * allowlisted runtime flag is explicitly enabled.
 */
export function useLegacyPerformanceWorkspacesEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    getLegacyPerformanceSnapshot,
    getServerSnapshot,
  );
}
