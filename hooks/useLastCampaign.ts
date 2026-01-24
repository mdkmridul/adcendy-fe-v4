'use client';

export const LAST_CAMPAIGN_KEY = 'adcendy_last_campaign';

export function useLastCampaign() {
  const getLastCampaignId = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(LAST_CAMPAIGN_KEY);
    } catch {
      return null;
    }
  };

  const setLastCampaignId = (id: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LAST_CAMPAIGN_KEY, id);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  };

  return { getLastCampaignId, setLastCampaignId };
}
