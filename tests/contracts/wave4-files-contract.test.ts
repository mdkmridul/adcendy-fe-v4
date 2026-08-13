import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const manifest = JSON.parse(read('config/deployment/files-contract.json'));
const rawContract = read('contracts/backend/files-v1/2.0.0/adcendy-files.openapi.json');
const openapi = JSON.parse(rawContract);

test('pins the immutable Backend files contract and checksum', () => {
  assert.equal(manifest.backendRevision, 'working-tree@e8e31b036fcf36ebea9cf1a28b90754cde93e964');
  assert.equal(manifest.openApiVersion, '2.0.0');
  assert.equal(
    createHash('sha256').update(rawContract).digest('hex'),
    '5609111fab1a4212749153af32efc0c2677ffdfbb2eba6c9c590f08de64506b9',
  );
});

test('publishes only the three canonical document operations', () => {
  assert.deepEqual(Object.keys(openapi.paths).sort(), [
    '/v1/campaigns/{campaignId}/documents',
    '/v1/campaigns/{campaignId}/documents/{documentId}/download',
  ]);
  assert.ok(openapi.paths['/v1/campaigns/{campaignId}/documents'].get);
  assert.ok(openapi.paths['/v1/campaigns/{campaignId}/documents'].post);
});

test('generated clients retain canonical IDs and never restore legacy aliases', () => {
  const generated = read('src/generated/files-v1.ts');
  assert.match(generated, /documentId: string/);
  assert.match(generated, /downloadUrl: string/);
  assert.doesNotMatch(generated, /artifactId:/);
  assert.doesNotMatch(generated, /\/artifacts/);
  assert.doesNotMatch(generated, /signedUrl:/);
  assert.doesNotMatch(generated, /storageKey:/);
});

test('download authorization always binds child IDs to campaign IDs', () => {
  const adapter = read('shared/api/real/campaignDocuments.real.ts');
  assert.match(
    adapter,
    /campaigns\/\$\{encodePathSegment\(campaignId\)\}\/documents\/\$\{encodePathSegment\(documentId\)\}\/download/,
  );
  assert.doesNotMatch(adapter, /\/artifacts/);
  assert.doesNotMatch(adapter, /storageKey/);
});

test('upload is exposed to Reviewer and Admin workspaces, never the Client File Hub', () => {
  const clientHub = read('shared/components/campaigns/CampaignFileHub.tsx');
  const adminCampaign = read('app/(app)/app/admin/campaigns/[campaignId]/page.tsx');
  const reviewerTask = read('app/(app)/app/reviewer/tasks/[taskId]/page.tsx');

  assert.doesNotMatch(clientHub, /CampaignDocumentUploader/);
  assert.doesNotMatch(clientHub, /CampaignArtifact/);
  assert.match(adminCampaign, /CampaignDocumentUploader/);
  assert.doesNotMatch(adminCampaign, /CampaignArtifactGenerator/);
  assert.match(reviewerTask, /CampaignDocumentUploader/);
});

test('the Client File Hub downloads files without navigating the active tab', () => {
  const clientHub = read('shared/components/campaigns/CampaignFileHub.tsx');
  const downloadHelper = read('lib/download.ts');

  assert.match(clientHub, /downloadFileFromUrl/);
  assert.doesNotMatch(clientHub, /window\.location\.assign/);
  assert.match(downloadHelper, /anchor\.download = filename/);
  assert.match(downloadHelper, /anchor\.click\(\)/);
});
