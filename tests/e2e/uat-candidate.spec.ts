import { expect, test, type Page } from '@playwright/test';

const clientUser = {
  id: 'e2e-client-user',
  email: 'client.e2e@adcendy.com',
  role: 'CLIENT',
  createdAt: '2026-07-29T00:00:00.000Z',
};

const authSession = {
  accessToken: 'e2e-access-token-kept-in-memory',
  user: clientUser,
};

async function installAuthBackend(page: Page) {
  let sessionAvailable = false;

  await page.route('**/v1/auth/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (pathname === '/v1/auth/login') {
      sessionAvailable = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: authSession,
          meta: { requestId: 'e2e-login' },
        }),
      });
      return;
    }

    if (pathname === '/v1/auth/refresh' && sessionAvailable) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: authSession,
          meta: { requestId: 'e2e-refresh' },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'No browser session is available.',
        },
      }),
    });
  });
}

test('serves a no-store, same-origin runtime contract', async ({
  request,
}) => {
  const response = await request.get('/runtime-config.js');
  const script = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['cache-control']).toContain('no-store');
  expect(script).toContain('"APP_ENV":"local"');
  expect(script).toContain('"useMockData":true');
  expect(script).not.toContain('API_BASE_URL');
  expect(script).not.toContain('api.adcendy.com');
});

test('boots from the refresh cookie contract without persisting credentials', async ({
  page,
}) => {
  await installAuthBackend(page);
  await page.goto('/auth/login');

  await page.getByLabel('Email').fill(clientUser.email);
  await page.getByLabel('Password').fill('not-a-real-secret');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/app\/campaigns$/);
  await expect(
    page.getByRole('heading', { name: 'Campaigns' }),
  ).toBeVisible();

  const persistedCredentialKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) =>
      /token|refresh|adcendy_user/i.test(key),
    ),
  );
  expect(persistedCredentialKeys).toEqual([]);

  await page.reload();
  await expect(page).toHaveURL(/\/app\/campaigns$/);
  await expect(
    page.getByRole('heading', { name: 'Campaigns' }),
  ).toBeVisible();
});

test('blocks legacy performance workspaces from the first UAT scope', async ({
  page,
}) => {
  await installAuthBackend(page);
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(clientUser.email);
  await page.getByLabel('Password').fill('not-a-real-secret');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/app\/campaigns$/);

  await page.goto('/app/campaigns/campaign-002/weekly');
  await expect(
    page.getByRole('heading', {
      name: 'Not included in the first UAT scope',
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Weekly' })).toHaveCount(0);
});
