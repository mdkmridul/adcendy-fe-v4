import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const realAdapter = read('shared/api/real/adminReview.real.ts');
const adminCampaignPage = read('app/(app)/app/admin/campaigns/[campaignId]/page.tsx');
const adminTypes = read('shared/types/admin.ts');

test('admin campaign permanent deletion calls the guarded backend contract', () => {
  assert.match(realAdapter, /`\/v1\/admin\/campaigns\/\$\{campaignId\}`/);
  assert.match(realAdapter, /method: 'DELETE'/);
  assert.match(realAdapter, /query: \{ confirmation \}/);
});

test('admin campaign danger zone requires the exact DELETE phrase before deletion', () => {
  assert.match(adminTypes, /ADMIN_CAMPAIGN_DELETE_CONFIRMATION = 'DELETE'/);
  assert.match(adminCampaignPage, /Danger Zone/);
  assert.match(adminCampaignPage, /ADMIN_CAMPAIGN_DELETE_CONFIRMATION/);
  assert.doesNotMatch(adminCampaignPage, /Enter the exact campaign ID/);
  assert.match(adminCampaignPage, /Permanently Delete Campaign/);
  assert.match(adminCampaignPage, /router\.replace\('\/admin\/campaigns'\)/);
});

test('admin campaign deletion explains retained and blocking data', () => {
  assert.match(adminCampaignPage, /Active jobs block deletion/);
  assert.match(adminCampaignPage, /Shared files and the financial ledger are retained for safety/);
});
