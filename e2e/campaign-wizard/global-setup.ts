import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { resolveCampaignTarget } from './environment';

export const campaignAuthStatePath = path.resolve(
  process.cwd(),
  'test-results',
  'campaign-wizard-auth',
  'storage-state.json',
);

export default async function campaignGlobalSetup() {
  const { baseURL } = resolveCampaignTarget();
  const email = process.env.ADCENDY_TEST_EMAIL?.trim();
  const password = process.env.ADCENDY_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'ADCENDY_TEST_EMAIL and ADCENDY_TEST_PASSWORD are required for campaign wizard execution',
    );
  }

  fs.mkdirSync(path.dirname(campaignAuthStatePath), { recursive: true });
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto(`${baseURL}/auth/login`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    const [loginResponse] = await Promise.all([
      page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          response.request().method() === 'POST' &&
          url.pathname === '/v1/auth/login'
        );
      }),
      page.getByRole('button', { name: 'Sign In' }).click(),
    ]);
    if (!loginResponse.ok()) {
      throw new Error(
        `Dedicated test account login failed with HTTP ${loginResponse.status()}`,
      );
    }

    await page.waitForURL((url) => url.pathname === '/app/campaigns');
    await page
      .getByRole('heading', { name: 'Campaigns', exact: true })
      .waitFor();
    await context.storageState({ path: campaignAuthStatePath });
    await context.close();
  } finally {
    await browser.close();
  }
}
