/**
 * Auth Redirect Utilities
 * 
 * Handles redirect logic after successful authentication:
 * 1. If `next` query param exists -> redirect there
 * 2. Else if lastCampaignId exists -> /app/campaigns/{id}/overview
 * 3. Else -> /app/campaigns
 */

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
 * @returns Redirect URL
 */
export function getAuthRedirectUrl(nextParam?: string | null): string {
  // Priority 1: next param
  if (nextParam) {
    return nextParam;
  }

  // Priority 2: last campaign
  const lastCampaignId = getLastCampaignId();
  if (lastCampaignId) {
    return `/app/campaigns/${lastCampaignId}/overview`;
  }

  // Priority 3: campaigns list
  return '/app/campaigns';
}
