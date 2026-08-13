import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const adapter = read('shared/api/real/opsV2.real.ts');
const runsAdapter = read('shared/api/real/runsV2.real.ts');
const adminCampaign = read('app/(app)/app/admin/campaigns/[campaignId]/page.tsx');

test('admin campaign UI exposes separate new-run and active-campaign rebuild contracts', () => {
  assert.match(runsAdapter, />\('\/api\/v2\/pipeline\/runs', \{/);
  assert.match(
    adapter,
    /`\/api\/v2\/admin\/campaigns\/\$\{campaignId\}\/triggers\/\$\{trigger\}`/,
  );
  assert.match(adminCampaign, /label="Start New Pipeline Run"/);
  assert.match(adminCampaign, /badge="No active run"/);
  assert.match(adminCampaign, /handleStartPipelineRun\(\)/);
  assert.match(adminCampaign, /label="Rebuild Active Campaign"/);
  assert.match(adminCampaign, /badge="Deletes old V2 files"/);
  assert.match(
    adminCampaign,
    /handleTriggerCampaign\('pipeline', 'Rebuild Active Campaign'\)/,
  );
});

test('new-run action is unavailable for backend-active run states', () => {
  assert.match(
    adminCampaign,
    /\['QUEUED', 'RUNNING', 'BLOCKED_AWAITING_REVIEW'\]/,
  );
  assert.match(
    adminCampaign,
    /disabled=\{startRunMutation\.isPending \|\| hasActivePipelineRun\}/,
  );
});

test('active-campaign rebuild requires an explicit destructive confirmation', () => {
  assert.match(adminCampaign, /Rebuild this active campaign\?/);
  assert.match(adminCampaign, /Manually uploaded campaign files are kept\./);
  assert.match(adminCampaign, /Delete old V2 files and rebuild/);
});
