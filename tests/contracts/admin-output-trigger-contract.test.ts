import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const adminCampaignPage = read('app/(app)/app/admin/campaigns/[campaignId]/page.tsx');
const reviewerTaskPage = read('app/(app)/app/reviewer/tasks/[taskId]/page.tsx');

for (const [surface, source] of [
  ['admin campaign', adminCampaignPage],
  ['reviewer task', reviewerTaskPage],
] as const) {
  test(`${surface} output preview uses the queued output-trigger contract`, () => {
    assert.match(source, /label="Assemble Output Preview"/);
    assert.match(
      source,
      /handleTriggerCampaign\(\s*['"]output['"],\s*['"]Assemble Output Preview['"]\s*\)/,
    );
    assert.match(source, /pendingLabel="Queuing\.\.\."/);
    assert.doesNotMatch(source, /handleDownloadAssembledOutput/);
    assert.doesNotMatch(source, /downloadCampaignOutputMutation/);
  });
}

test('admin output controls distinguish preview assembly from the official kit', () => {
  assert.match(adminCampaignPage, /This does not publish the official four-document deliverable kit/);
  assert.match(adminCampaignPage, /label="Generate Complete Kit"/);
});
