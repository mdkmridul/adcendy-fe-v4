import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function read(relativePath: string): string {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

test('wizard commit uses one parent-owned completion navigation', () => {
  const wizard = read('shared/components/campaigns/CampaignWizardModal.tsx');
  const campaignsPage = read('app/(app)/app/campaigns/page.tsx');

  assert.match(wizard, /onCommitSuccess\(\s*returnedRunId/);
  assert.doesNotMatch(
    wizard,
    /onOpenChange\(false\);\s*const returnedRunId[\s\S]*?router\.push/,
  );
  assert.match(campaignsPage, /onCommitSuccess=\{\(href\) => \{/);
  assert.match(campaignsPage, /router\.replace\(href\)/);
});
