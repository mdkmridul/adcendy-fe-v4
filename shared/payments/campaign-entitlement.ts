import type { UserProfile } from '@/shared/types/user-profile';

export const CAMPAIGN_PLAN_ROUTE =
  '/app/checkout?reason=campaign-entitlement';

export function hasCampaignEntitlement(
  profile: UserProfile | null | undefined,
): boolean {
  return Boolean(
    profile &&
      (profile.billing.creditBalance > 0 ||
        (profile.billing.subscription.available &&
          profile.billing.subscription.status === 'ACTIVE')),
  );
}
