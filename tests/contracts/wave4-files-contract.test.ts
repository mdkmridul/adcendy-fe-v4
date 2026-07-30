import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const manifest = JSON.parse(read('config/deployment/files-contract.json'));
const rawContract = read(
  'contracts/backend/files-v1/1.0.0/adcendy-files.openapi.json',
);
const openapi = JSON.parse(rawContract);

test('pins the immutable Backend files contract and checksum', () => {
  assert.equal(
    manifest.backendRevision,
    'working-tree@79324473cab50871875fc8c7472c440125b277a9',
  );
  assert.equal(manifest.openApiVersion, '1.0.0');
  assert.equal(
    createHash('sha256').update(rawContract).digest('hex'),
    '9801f8ada9814bf91ee56c267b13105b92cdea6733df10323e56346b1b2c88ba',
  );
});

test('publishes all six canonical document and artifact operations', () => {
  assert.deepEqual(Object.keys(openapi.paths).sort(), [
    '/v1/campaigns/{campaignId}/artifacts',
    '/v1/campaigns/{campaignId}/artifacts/pdf',
    '/v1/campaigns/{campaignId}/artifacts/{artifactId}/download',
    '/v1/campaigns/{campaignId}/documents',
    '/v1/campaigns/{campaignId}/documents/{documentId}/download',
  ]);
  assert.ok(openapi.paths['/v1/campaigns/{campaignId}/documents'].get);
  assert.ok(openapi.paths['/v1/campaigns/{campaignId}/documents'].post);
});

test('generated clients retain canonical IDs and never restore legacy aliases', () => {
  const generated = read('src/generated/files-v1.ts');
  assert.match(generated, /documentId: string/);
  assert.match(generated, /artifactId: string/);
  assert.match(generated, /downloadUrl: string/);
  assert.doesNotMatch(generated, /signedUrl:/);
  assert.doesNotMatch(generated, /storageKey:/);
});

test('download authorization always binds child IDs to campaign IDs', () => {
  const adapter = read('shared/api/real/campaignDocuments.real.ts');
  assert.match(
    adapter,
    /campaigns\/\$\{encodePathSegment\(campaignId\)\}\/documents\/\$\{encodePathSegment\(documentId\)\}\/download/,
  );
  assert.match(
    adapter,
    /campaigns\/\$\{encodePathSegment\(campaignId\)\}\/artifacts\/\$\{encodePathSegment\(artifactId\)\}\/download/,
  );
  assert.doesNotMatch(adapter, /storageKey/);
});

test('upload is exposed to Reviewer and Admin workspaces, never the Client File Hub', () => {
  const clientHub = read('shared/components/campaigns/CampaignFileHub.tsx');
  const adminCampaign = read(
    'app/(app)/app/admin/campaigns/[campaignId]/page.tsx',
  );
  const reviewerTask = read(
    'app/(app)/app/reviewer/tasks/[taskId]/page.tsx',
  );

  assert.doesNotMatch(clientHub, /CampaignDocumentUploader/);
  assert.match(adminCampaign, /CampaignDocumentUploader/);
  assert.match(adminCampaign, /CampaignArtifactGenerator/);
  assert.match(reviewerTask, /CampaignDocumentUploader/);
});
