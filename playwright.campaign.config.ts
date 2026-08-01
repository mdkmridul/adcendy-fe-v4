import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { resolveCampaignTarget } from './e2e/campaign-wizard/environment';
import { campaignAuthStatePath } from './e2e/campaign-wizard/global-setup';

const { baseURL } = resolveCampaignTarget();

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'campaign-wizard.spec.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 180_000,
  globalSetup: './e2e/campaign-wizard/global-setup.ts',
  outputDir: './e2e/results/campaigns/artifacts',
  reporter: [
    ['list'],
    ['json', { outputFile: './e2e/results/campaigns/playwright-report.json' }],
    ['html', { outputFolder: './e2e/results/campaigns/html', open: 'never' }],
  ],
  use: {
    baseURL,
    storageState: campaignAuthStatePath,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'campaign-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  metadata: {
    reportDirectory: path.resolve(process.cwd(), 'e2e', 'results', 'campaigns'),
    submitCampaign: process.env.SUBMIT_CAMPAIGN?.toLowerCase() === 'true',
  },
});
