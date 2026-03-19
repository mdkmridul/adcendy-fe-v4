/**
 * Auth Redirect Utilities
 * 
 * Handles redirect logic after successful authentication:
 * 1. If `next` query param exists -> redirect there
 * 2. Else route by authenticated role
 * 3. For clients, prefer last campaign if available
 * 4. Else -> /app/campaigns
 */

import type { Role } from '@/features/auth/types';

function normalizePrivilegedNext(nextParam?: string | null): string | null {
  if (!nextParam) {
    return null;
  }

  if (nextParam === '/app/admin') {
    return '/admin';
  }

  if (nextParam.startsWith('/app/admin/')) {
    return nextParam.replace('/app/admin', '/admin');
  }

  return nextParam;
}

function isAdminNextPath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/');
}

function isReviewerNextPath(path: string): boolean {
  return (
    path === '/app/reviewer' ||
    path.startsWith('/app/reviewer/') ||
    path === '/app/review' ||
    path.startsWith('/app/review/') ||
    /^\/app\/campaigns\/[^/]+\/review(?:\/|$)/.test(path)
  );
}

/**
 * Get last campaign ID from localStorage
 */
export function getLastCampaignId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adcendy_last_campaign_id');
}

/**
 * Calculate redirect URL after authentication
 * 
 * @param nextParam - Optional next URL from query params
 * @param role - Authenticated user role from login response
 * @returns Redirect URL
 */
export function getAuthRedirectUrl(nextParam?: string | null, role?: Role): string {
  const normalizedNext = normalizePrivilegedNext(nextParam);

  if (role === 'ADMIN') {
    if (normalizedNext && isAdminNextPath(normalizedNext)) {
      return normalizedNext;
    }

    return '/admin';
  }

  if (role === 'REVIEWER') {
    if (normalizedNext && isReviewerNextPath(normalizedNext)) {
      return normalizedNext;
    }

    return '/app/reviewer/strategy-reviews';
  }

  // Priority 1: next param
  if (normalizedNext) {
    return normalizedNext;
  }

  // Priority 2: last campaign
  const lastCampaignId = getLastCampaignId();
  if (lastCampaignId) {
    return `/app/campaigns/${lastCampaignId}/overview`;
  }

  // Priority 3: campaigns list
  return '/app/campaigns';
}
