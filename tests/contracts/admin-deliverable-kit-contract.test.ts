import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const realAdapterSource = fs.readFileSync(
  path.resolve(process.cwd(), 'shared', 'api', 'real', 'opsV2.real.ts'),
  'utf8',
);
const repositorySource = fs.readFileSync(
  path.resolve(process.cwd(), 'shared', 'api', 'repositories', 'opsV2.repo.ts'),
  'utf8',
);
const adminCampaignSource = fs.readFileSync(
  path.resolve(
    process.cwd(),
    'app',
    '(app)',
    'app',
    'admin',
    'campaigns',
    '[campaignId]',
    'page.tsx',
  ),
  'utf8',
);

test('complete-kit action posts the generated request contract to the run-scoped admin route', () => {
  assert.match(
    realAdapterSource,
    /`\/api\/v2\/admin\/runs\/\$\{runId\}\/deliverable-kits`/,
  );
  assert.match(realAdapterSource, /body: payload/);
  assert.match(repositorySource, /generateAdminDeliverableKit/);
  assert.match(repositorySource, /GenerateDeliverableKitV2Payload/);
  assert.match(repositorySource, /QueuedDeliverableKitV2/);
});

test('admin UI exposes approval-gated kit generation and explicit owner notification control', () => {
  assert.match(adminCampaignSource, /label="Generate Complete Kit"/);
  assert.match(adminCampaignSource, /badge="4 documents"/);
  assert.match(adminCampaignSource, /Notify the campaign owner\?/);
  assert.match(adminCampaignSource, /handleGenerateDeliverableKit\(true\)/);
  assert.match(adminCampaignSource, /handleGenerateDeliverableKit\(false\)/);
  assert.match(adminCampaignSource, /Generate and notify owner/);
  assert.match(adminCampaignSource, /Generate without email/);
});
