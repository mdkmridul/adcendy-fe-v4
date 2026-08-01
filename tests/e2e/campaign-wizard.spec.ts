import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import { CampaignWizardPage } from '../../e2e/campaign-wizard/CampaignWizardPage';
import type {
  CampaignExecutionReport,
  CampaignFixture,
} from '../../e2e/campaign-wizard/campaign-types';
import {
  resolveCampaignTarget,
  shouldSubmitCampaign,
} from '../../e2e/campaign-wizard/environment';
// The validator is shared with the pre-browser runner and intentionally remains
// plain ESM so `node scripts/validate-campaign-fixtures.mjs` can run without a TS loader.
import { campaignFixtureSchema } from '../../e2e/campaign-wizard/campaign-fixture-schema.mjs';

const fixtureDirectory = path.resolve(process.cwd(), 'e2e', 'fixtures', 'campaigns');
const requestedFixtureSlug = process.env.ADCENDY_FIXTURE_SLUG?.trim();
const fixtures = fs
  .readdirSync(fixtureDirectory)
  .filter((file) => file.endsWith('.json'))
  .filter((file) => !requestedFixtureSlug || path.basename(file, '.json') === requestedFixtureSlug)
  .sort()
  .map((file) => {
    const fixturePath = path.join(fixtureDirectory, file);
    const raw = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const parsed = campaignFixtureSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Invalid campaign fixture ${fixturePath}:\n${issues}`);
    }
    return parsed.data as CampaignFixture;
  });

if (requestedFixtureSlug && fixtures.length === 0) {
  throw new Error(`No campaign fixture matched ADCENDY_FIXTURE_SLUG=${requestedFixtureSlug}`);
}

const { baseURL, environment } = resolveCampaignTarget();
const submitEnabled = shouldSubmitCampaign();

for (const fixture of fixtures) {
  test(`populate campaign wizard: ${fixture.displayName}`, async ({ page }, testInfo) => {
    test.skip(
      fixture.fixtureStatus === 'placeholder',
      'Fixture is an initial placeholder; replace REPLACE_WITH_ values and set fixtureStatus to ready.',
    );

    const report: CampaignExecutionReport = {
      fixture: fixture.slug,
      displayName: fixture.displayName,
      environment,
      baseURL,
      submitEnabled,
      status: 'running',
      startedAt: new Date().toISOString(),
      validationFailures: [],
      unsupportedFields: [],
    };
    const reportPath = path.resolve(
      process.cwd(),
      'e2e',
      'results',
      'campaigns',
      `${fixture.slug}.json`,
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    const wizard = new CampaignWizardPage(page, fixture, report);

    try {
      await wizard.openNewCampaign();
      await wizard.populateStep1();
      await wizard.populateStep2();
      await wizard.populateStep3();
      await wizard.populateStep4();
      await wizard.populateStep5();
      await wizard.populateStep6();
      await wizard.validateReview();
      await wizard.confirmReview();

      if (submitEnabled) {
        await wizard.submit();
      } else {
        await wizard.captureReviewOnly();
      }
    } catch (error) {
      report.status = 'failed';
      report.finalUrl = page.url();
      report.error = error instanceof Error ? error.stack ?? error.message : String(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (/^Unsupported (card|select|sensitiveCategoryFlags)/.test(errorMessage)) {
        report.unsupportedFields.push({
          path: 'wizard',
          message: errorMessage,
        });
      } else if (report.validationFailures.length === 0) {
        report.validationFailures.push({
          path: 'browser-workflow',
          message: errorMessage,
        });
      }
      const failureScreenshot = path.resolve(
        process.cwd(),
        'e2e',
        'results',
        'campaigns',
        `${fixture.slug}-failure.png`,
      );
      await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => undefined);
      report.screenshot = failureScreenshot;
      throw error;
    } finally {
      report.completedAt = new Date().toISOString();
      report.finalUrl ??= page.url();
      fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      await testInfo.attach('campaign-execution-report', {
        path: reportPath,
        contentType: 'application/json',
      });
    }
  });
}
