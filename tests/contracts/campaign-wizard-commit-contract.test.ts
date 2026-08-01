import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const adapterSource = fs.readFileSync(
  path.resolve(process.cwd(), 'shared', 'api', 'real', 'wizard.real.ts'),
  'utf8',
);

test('wizard commit forwards every backend confirmation gate', () => {
  for (const field of [
    'confirmFocus',
    'confirmBusiness',
    'confirmAudience',
    'confirmGoals',
    'confirmEconomics',
    'readyToGenerate',
    'dataConsentOptIn',
  ]) {
    assert.match(
      adapterSource,
      new RegExp(`${field}: payload\\.${field}`),
      `Expected commit request to forward ${field}`,
    );
  }
});
