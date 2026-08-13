import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAMPAIGN_PLAN_ROUTE,
  hasCampaignEntitlement,
} from '../../shared/payments/campaign-entitlement.ts';
import type { UserProfile } from '../../shared/types/user-profile.ts';

const profile = (
  creditBalance: number,
  subscriptionStatus: UserProfile['billing']['subscription']['status'],
): UserProfile => ({
  id: 'user-1',
  email: 'user@example.com',
  role: 'CLIENT',
  displayName: null,
  phone: null,
  avatarUrl: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  billing: {
    purchaseModel: 'ONE_TIME_CREDITS',
    creditBalance,
    subscription: {
      provider: 'RAZORPAY',
      available: subscriptionStatus !== 'NOT_AVAILABLE',
      status: subscriptionStatus,
      planCode: null,
      providerSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  },
});

test('campaign creation requires a credit or active subscription', () => {
  assert.equal(hasCampaignEntitlement(profile(0, 'NOT_AVAILABLE')), false);
  assert.equal(hasCampaignEntitlement(profile(0, 'INACTIVE')), false);
  assert.equal(hasCampaignEntitlement(profile(1, 'NOT_AVAILABLE')), true);
  assert.equal(hasCampaignEntitlement(profile(0, 'ACTIVE')), true);

  const unavailableActiveSubscription = profile(0, 'ACTIVE');
  unavailableActiveSubscription.billing.subscription.available = false;
  assert.equal(hasCampaignEntitlement(unavailableActiveSubscription), false);
});

test('campaign entitlement redirects to the checkout plan screen', () => {
  assert.equal(CAMPAIGN_PLAN_ROUTE, '/app/checkout?reason=campaign-entitlement');
});
