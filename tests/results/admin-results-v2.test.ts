import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessPath } from '../../features/auth/rbac.ts';
import type { AuthUser } from '../../features/auth/types.ts';
import {
  adminResultsCampaignV2,
  campaignMarketCodesV2,
  resultsOpenForStatusV2,
} from '../../shared/components/results/channelResultsV2.ts';

// Admins could not open a campaign's Results page: /app/campaigns is for
// campaign owners only, and the page loaded the campaign through the owner's
// own call. Admins now have a Results view under the admin area.

const userWithRole = (role: 'ADMIN' | 'CLIENT' | 'REVIEWER') =>
  ({ id: 'user-1', email: 'someone@example.com', role }) as unknown as AuthUser;

test('admins open results in the admin area; clients in their own workspace', () => {
  const admin = userWithRole('ADMIN');
  const client = userWithRole('CLIENT');
  const reviewer = userWithRole('REVIEWER');

  for (const path of ['/app/admin/campaigns/c1/results', '/admin/campaigns/c1/results']) {
    assert.equal(canAccessPath(admin, path), true, path);
    assert.equal(canAccessPath(client, path), false, path);
    assert.equal(canAccessPath(reviewer, path), false, path);
  }

  // The client workspace stays for campaign owners, which is why admins need
  // their own view.
  assert.equal(canAccessPath(client, '/app/campaigns/c1/results'), true);
  assert.equal(canAccessPath(admin, '/app/campaigns/c1/results'), false);
});

test('results open once the plan is delivered', () => {
  assert.equal(resultsOpenForStatusV2('ACTIVE'), true);
  assert.equal(resultsOpenForStatusV2('ARCHIVED'), true);
  assert.equal(resultsOpenForStatusV2('active'), true);
  for (const status of ['DRAFT', 'IN_REVIEW', 'SUBMITTED_FOR_REVIEW', 'FAILED', '', null, undefined]) {
    assert.equal(resultsOpenForStatusV2(status), false, String(status));
  }
});

test('the admin view takes the campaign from the admin detail and its markets from the overview', () => {
  assert.equal(adminResultsCampaignV2(null, null), null);
  assert.equal(adminResultsCampaignV2(undefined, { v2PrimaryMarket: 'IN' }), null);

  const detail = {
    campaign: { title: 'Ultrahuman', status: 'ACTIVE', owner: { email: 'owner@example.com' } },
  };
  const campaign = adminResultsCampaignV2(detail, { v2PrimaryMarket: 'IN', v2TargetMarkets: ['IN', 'US'] });
  assert.deepEqual(campaign, {
    title: 'Ultrahuman',
    status: 'ACTIVE',
    ownerEmail: 'owner@example.com',
    v2PrimaryMarket: 'IN',
    v2TargetMarkets: ['IN', 'US'],
  });
  assert.deepEqual(campaignMarketCodesV2(campaign!), ['IN', 'US']);

  // Before the overview arrives, or when it does not list the campaign, the
  // form falls back to the markets already reported and the common list.
  const withoutOverview = adminResultsCampaignV2(detail, null);
  assert.deepEqual(campaignMarketCodesV2(withoutOverview!), []);
  assert.equal(withoutOverview!.status, 'ACTIVE');
});
