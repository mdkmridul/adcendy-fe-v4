import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCampaignFixtures } from './validate-campaign-fixtures.mjs';

function readFixtureSlug(argv) {
  const fixtureFlag = argv.indexOf('--fixture');
  if (fixtureFlag === -1) {
    return undefined;
  }
  const slug = argv[fixtureFlag + 1];
  if (!slug) {
    throw new Error('--fixture requires a fixture slug');
  }
  return slug;
}

const fixtureSlug = readFixtureSlug(process.argv.slice(2));
const validation = validateCampaignFixtures({ fixtureSlug });

if (validation.invalid.length > 0) {
  process.stderr.write(
    `${JSON.stringify(
      {
        error: 'CAMPAIGN_FIXTURE_VALIDATION_FAILED',
        fixtures: validation.invalid.map((result) => ({
          fixture: result.slug,
          issues: result.issues,
          reportPath: result.reportPath,
        })),
      },
      null,
      2,
    )}\n`,
  );
  process.exit(1);
}

if (validation.ready.length === 0) {
  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'no-ready-fixtures',
        message:
          'All selected campaign fixtures are placeholders. Replace REPLACE_WITH_ values and set fixtureStatus to "ready" before browser execution.',
        fixtures: validation.placeholders.map((result) => ({
          fixture: result.slug,
          placeholderPaths: result.placeholderPaths,
          reportPath: result.reportPath,
        })),
      },
      null,
      2,
    )}\n`,
  );
  process.exit(0);
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const playwrightCli = path.join(
  projectRoot,
  'node_modules',
  '@playwright',
  'test',
  'cli.js',
);
const child = spawn(
  process.execPath,
  [
    playwrightCli,
    'test',
    'tests/e2e/campaign-wizard.spec.ts',
    '--config',
    'playwright.campaign.config.ts',
  ],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      ADCENDY_FIXTURE_SLUG: fixtureSlug ?? '',
      SUBMIT_CAMPAIGN: process.env.SUBMIT_CAMPAIGN ?? 'false',
    },
    stdio: 'inherit',
  },
);

child.on('error', (error) => {
  process.stderr.write(
    `${JSON.stringify(
      {
        error: 'PLAYWRIGHT_PROCESS_START_FAILED',
        message: error.message,
      },
      null,
      2,
    )}\n`,
  );
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
