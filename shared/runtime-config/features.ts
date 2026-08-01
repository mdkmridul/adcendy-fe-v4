'use client';

import { useSyncExternalStore } from 'react';
import {
  getBrowserRuntimeConfig,
  RUNTIME_CONFIG_READY_EVENT,
} from './types';

function subscribeToStaticConfig(): () => void {
  return () => undefined;
}

function subscribeToRuntimeConfig(onStoreChange: () => void): () => void {
  window.addEventListener(RUNTIME_CONFIG_READY_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(RUNTIME_CONFIG_READY_EVENT, onStoreChange);
}

function getRuntimeConfigReadySnapshot(): boolean {
  return getBrowserRuntimeConfig() !== null;
}

function getRuntimeConfigServerSnapshot(): boolean {
  return false;
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
    subscribeToStaticConfig,
    getLegacyPerformanceSnapshot,
    getServerSnapshot,
  );
}

export function useRuntimeConfigReady(): boolean {
  return useSyncExternalStore(
    subscribeToRuntimeConfig,
    getRuntimeConfigReadySnapshot,
    getRuntimeConfigServerSnapshot,
  );
}
