import fs from 'node:fs';
import path from 'node:path';
import { expect, type Locator, type Page, type Response } from '@playwright/test';
import type { CampaignExecutionReport, CampaignFixture } from './campaign-types';

const STATIC_OPTION_LABELS: Record<string, string> = {
  nothing: "I don't spend anything",
  under_5k: 'Under INR 5,000',
  '5k_15k': 'INR 5,000 to INR 15,000',
  '15k_50k': 'INR 15,000 to INR 50,000',
  '50k_plus': 'Above INR 50,000',
  under_500: 'Under 500 visits',
  '500_2000': '500 to 2,000 visits',
  '2000_10000': '2,000 to 10,000 visits',
  '10000_50000': '10,000 to 50,000 visits',
  '50000_plus': 'Above 50,000 visits',
  one_time_buyers: 'Mostly one-time buyers',
  some_repeat: 'Some customers come back',
  mostly_repeat: 'Many customers come back',
  subscription: 'Subscription-based',
  never: 'Rarely or never',
  twitter: 'Twitter / X',
  true: 'Connected',
  false: 'Not connected',
  unknown: 'Unknown',
};

const EMAIL_LIST_OPTION_LABELS: Record<string, string> = {
  none: 'No email list',
  under_500: 'Under 500 contacts',
  '500_2000': '500 to 2,000 contacts',
  '2000_10000': '2,000 to 10,000 contacts',
  '10000_plus': 'Above 10,000 contacts',
};

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function responsePath(response: Response) {
  return new URL(response.url()).pathname;
}

function isMutation(response: Response, method: string, pathname: string) {
  return (
    response.request().method() === method &&
    responsePath(response) === pathname
  );
}

export class CampaignWizardPage {
  constructor(
    private readonly page: Page,
    private readonly fixture: CampaignFixture,
    readonly report: CampaignExecutionReport,
  ) {}

  private field(fieldPath: string) {
    return this.page.getByTestId(`campaign-wizard-${fieldPath}`);
  }

  private async requireOk(response: Response, operation: string) {
    if (response.ok()) {
      return;
    }
    const body = await response.text();
    const message = `${operation} failed with HTTP ${response.status()}: ${body}`;
    this.report.validationFailures.push({ path: operation, message });
    throw new Error(message);
  }

  private async fill(fieldPath: string, value: string | undefined) {
    if (value === undefined) {
      return;
    }
    const field = this.field(fieldPath);
    await expect(field, `Wizard field ${fieldPath} should be visible`).toBeVisible();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  private async addTags(fieldPath: string, values: string[] | undefined) {
    for (const value of values ?? []) {
      const input = this.field(fieldPath);
      await expect(input).toBeVisible();
      await input.fill(value);
      await input.press('Enter');
      await expect(this.page.getByRole('button', { name: `Remove ${value}` })).toBeVisible();
    }
  }

  private async chooseCard(fieldPath: string, desiredValue: string) {
    const prefix = `campaign-wizard-${fieldPath}-`;
    const candidates = this.page.getByTestId(new RegExp(`^${prefix}`));
    await expect(candidates.first()).toBeVisible();
    const count = await candidates.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      const testId = (await candidate.getAttribute('data-testid')) ?? '';
      if (normalizeToken(testId.slice(prefix.length)) === normalizeToken(desiredValue)) {
        await candidate.click();
        await expect(candidate).toHaveAttribute('aria-pressed', 'true');
        return;
      }
    }
    throw new Error(`Unsupported card value "${desiredValue}" for ${fieldPath}`);
  }

  private async chooseSelect(fieldPath: string, desiredValue: string) {
    const trigger = this.field(fieldPath);
    await expect(trigger, `Select ${fieldPath} should be visible`).toBeVisible();
    await trigger.click();
    const options = this.page.getByRole('option');
    await expect(options.first()).toBeVisible();
    const desiredLabel =
      fieldPath === 'emailListSize'
        ? EMAIL_LIST_OPTION_LABELS[desiredValue]
        : STATIC_OPTION_LABELS[desiredValue];
    const count = await options.count();
    for (let index = 0; index < count; index += 1) {
      const option = options.nth(index);
      const text = (await option.textContent())?.trim() ?? '';
      if (
        (desiredLabel && text === desiredLabel) ||
        normalizeToken(text) === normalizeToken(desiredValue)
      ) {
        await option.click();
        await expect(trigger).toContainText(text);
        return;
      }
    }
    const availableOptions = (await options.allTextContents())
      .map((option) => option.trim())
      .filter(Boolean);
    await this.page.keyboard.press('Escape');
    throw new Error(
      `Unsupported select value "${desiredValue}" for ${fieldPath}. Available options: ${availableOptions.join(', ')}`,
    );
  }

  private async chooseSensitiveFlag(desiredValue: string) {
    const prefix = 'campaign-wizard-sensitiveCategoryFlags-';
    const cards = this.page.getByTestId(new RegExp(`^${prefix}`));
    if ((await cards.count()) > 0) {
      const count = await cards.count();
      for (let index = 0; index < count; index += 1) {
        const card = cards.nth(index);
        const testId = (await card.getAttribute('data-testid')) ?? '';
        if (normalizeToken(testId.slice(prefix.length)) === normalizeToken(desiredValue)) {
          await card.click();
          await expect(card).toHaveAttribute('aria-pressed', 'true');
          return;
        }
      }
      throw new Error(`Unsupported sensitiveCategoryFlags value "${desiredValue}"`);
    }
    await this.addTags('sensitiveCategoryFlags', [desiredValue]);
  }

  private async assertStep(step: number) {
    await expect(this.page.getByTestId(`campaign-wizard-step-${step}`)).toBeVisible();
    await expect(this.page.getByText(new RegExp(`Step ${step} /`)).first()).toBeVisible();
  }

  private async submitStep<T>(
    step: number,
    nextButton: 'Continue' | 'Review',
    mutationPromise: Promise<T>,
  ) {
    const form = this.page.getByTestId(`campaign-wizard-step-${step}`);
    const validationFailurePromise = form
      .getByRole('alert')
      .first()
      .waitFor({ state: 'visible', timeout: 0 })
      .then(async () => {
        const messages = (await form.getByRole('alert').allTextContents())
          .map((message) => message.trim())
          .filter(Boolean);
        for (const message of messages) {
          this.report.validationFailures.push({
            path: `wizard.step${step}`,
            message,
          });
        }
        throw new Error(
          `Wizard step ${step} validation failed: ${messages.join('; ')}`,
        );
      });

    await this.page.getByRole('button', { name: nextButton, exact: true }).click();
    return Promise.race([mutationPromise, validationFailurePromise]);
  }

  private async saveStep(step: number, nextButton: 'Continue' | 'Review') {
    const responsePromise = this.page.waitForResponse((response) =>
      isMutation(response, 'PATCH', `/api/v2/wizard/steps/${step}`),
    );
    const response = await this.submitStep(step, nextButton, responsePromise);
    await this.requireOk(response, `wizard.step${step}`);
    await this.assertStep(step + 1);
  }

  async openNewCampaign() {
    await this.page.goto('/app/campaigns');
    await expect(
      this.page.getByRole('heading', { name: 'Campaigns', exact: true }),
    ).toBeVisible();
    await this.page
      .getByRole('button', {
        name: /^(New Campaign|Create First Campaign)$/,
      })
      .click();
    await this.assertStep(1);
  }

  async populateStep1() {
    const step = this.fixture.wizard.step1;
    await this.fill('title', step.title);
    await this.chooseCard('marketingTargetType', step.marketingTargetType);
    await this.fill('focusName', step.focusName);
    await this.addTags('targetMarkets', step.targetMarkets);
    if (step.targetMarkets.length > 1 && step.primaryMarket) {
      await this.chooseSelect('primaryMarket', step.primaryMarket);
    }
    await this.chooseSelect('marketScope', step.marketScope);
    if (['local', 'regional'].includes(step.marketScope)) {
      await this.addTags('operationalLocations', step.operationalLocations);
    }
    if (step.regionalLanguageExpansionEnabled) {
      await this.field('regionalLanguageExpansionEnabled').click();
      await expect(this.field('regionalLanguageExpansionEnabled')).toBeChecked();
      await this.addTags('regionalLanguages', step.regionalLanguages);
    }
    await this.chooseCard('sourceType', step.sourceType);
    if (step.sourceType === 'manual_only') {
      await expect(this.field('primaryUrl')).toHaveCount(0);
    } else {
      await expect(this.field('primaryUrl')).toBeVisible();
      await this.fill('primaryUrl', step.primaryUrl);
    }

    const campaignResponsePromise = this.page.waitForResponse((response) =>
      isMutation(response, 'POST', '/v1/campaigns'),
    );
    const patchResponsePromise = this.page.waitForResponse((response) =>
      isMutation(response, 'PATCH', '/api/v2/wizard/steps/1'),
    );
    const [campaignResponse] = await this.submitStep(
      1,
      'Continue',
      Promise.all([campaignResponsePromise, patchResponsePromise]),
    );
    await this.requireOk(campaignResponse, 'campaign.create');
    await this.requireOk(await patchResponsePromise, 'wizard.step1');
    const campaignPayload = await campaignResponse.json();
    this.report.campaignId =
      campaignPayload?.data?.id ?? campaignPayload?.id ?? campaignPayload?.data?.campaignId;
    if (!this.report.campaignId) {
      const currentUrl = new URL(this.page.url());
      this.report.campaignId = currentUrl.searchParams.get('draftCampaignId') ?? undefined;
    }
    await this.assertStep(2);
  }

  async populateStep2() {
    const step = this.fixture.wizard.step2;
    await this.fill('businessName', step.businessName);
    await this.chooseSelect('industryCategory', step.industryCategory);
    await this.chooseSelect('businessModel', step.businessModel);
    await this.chooseSelect('audienceModel', step.audienceModel);
    await this.chooseSelect('lifecycleStage', step.lifecycleStage);
    await this.fill('businessDescription', step.businessDescription);
    await this.fill('productCategory', step.productCategory);
    await this.addTags('productsServices', step.productsServices);
    await this.fill('priceRange', step.priceRange);
    await this.fill('offerSummary', step.offerSummary);
    await this.addTags('differentiators', step.differentiators);
    for (const flag of step.sensitiveCategoryFlags) {
      await this.chooseSensitiveFlag(flag);
    }
    await this.addTags('complianceSensitiveClaims', step.complianceSensitiveClaims);
    await this.saveStep(2, 'Continue');
  }

  async populateStep3() {
    const step = this.fixture.wizard.step3;
    await this.fill('primaryTargetSegment', step.primaryTargetSegment);
    await this.fill('targetPersona', step.targetPersona);
    await this.fill('targetAudience', step.targetAudience);
    await this.chooseSelect('language', step.language);
    if (step.reportLanguage) {
      await this.chooseSelect('reportLanguage', step.reportLanguage);
    }
    await this.addTags('audienceSegments', step.audienceSegments);
    await this.fill('desiredOutcome', step.desiredOutcome);
    await this.fill('decisionProcess', step.decisionProcess);
    await this.addTags('painPoints', step.painPoints);
    await this.addTags('buyerRoles', step.buyerRoles);
    await this.saveStep(3, 'Continue');
  }

  private async populateSalesChannels() {
    const channels = this.fixture.wizard.step4.salesChannels;
    for (let index = 0; index < channels.length; index += 1) {
      await this.page.getByTestId('campaign-wizard-add-salesChannel').click();
      const channel = channels[index];
      await this.chooseSelect(`salesChannels.${index}.channel`, channel.channel);
      await this.field(`salesChannels.${index}.rank`).fill(String(channel.rank));
      await expect(this.field(`salesChannels.${index}.rank`)).toHaveValue(String(channel.rank));
      if (channel.channel === 'other') {
        await this.fill(`salesChannels.${index}.customName`, channel.customName);
      }
    }
  }

  async populateStep4() {
    const step = this.fixture.wizard.step4;
    await this.populateSalesChannels();
    await this.chooseSelect('primaryConversionPath', step.primaryConversionPath);

    for (let index = 0; index < (step.socialHandles ?? []).length; index += 1) {
      const handle = step.socialHandles![index];
      await this.page.getByTestId('campaign-wizard-add-socialHandle').click();
      await this.chooseSelect(`socialHandles.${index}.platform`, handle.platform);
      await this.fill(`socialHandles.${index}.handle`, handle.handle);
    }

    for (let index = 0; index < (step.digitalPresenceLinks ?? []).length; index += 1) {
      const link = step.digitalPresenceLinks![index];
      await this.page.getByTestId('campaign-wizard-add-digitalPresenceLink').click();
      await this.chooseSelect(`digitalPresenceLinks.${index}.type`, link.type);
      await this.fill(`digitalPresenceLinks.${index}.url`, link.url);
      await this.fill(`digitalPresenceLinks.${index}.label`, link.label);
    }

    await this.addTags('trustSignals', step.trustSignals);
    if (step.monthlyWebsiteTraffic) {
      await this.chooseSelect('monthlyWebsiteTraffic', step.monthlyWebsiteTraffic);
    }
    if (step.emailListSize) {
      await this.chooseSelect('emailListSize', step.emailListSize);
    }
    if (step.googleAnalyticsConnected !== undefined && step.googleAnalyticsConnected !== '') {
      await this.chooseSelect('googleAnalyticsConnected', String(step.googleAnalyticsConnected));
    }
    await this.saveStep(4, 'Continue');
  }

  async populateStep5() {
    const step = this.fixture.wizard.step5;
    await this.chooseSelect('monthlyMarketingSpend', step.monthlyMarketingSpend);
    await this.chooseSelect('primaryGoal', step.primaryGoal);
    await this.chooseSelect('marketingHandler', step.marketingHandler);
    await this.fill('paidMediaBudgetRange', step.paidMediaBudgetRange);
    await this.chooseSelect('contentCapacity', step.contentCapacity);
    await this.fill('salesCapacity', step.salesCapacity);
    await this.chooseSelect('knownCompetitorStatus', step.knownCompetitorStatus);
    await this.addTags('constraints', step.constraints);

    for (let index = 0; index < (step.currentMarketingActivity ?? []).length; index += 1) {
      const activity = step.currentMarketingActivity![index];
      await this.page.getByTestId('campaign-wizard-add-currentMarketingActivity').click();
      await this.fill(`currentMarketingActivity.${index}.channel`, activity.channel);
      await this.chooseSelect(`currentMarketingActivity.${index}.status`, activity.status);
      if (activity.workingAssessment) {
        await this.chooseSelect(
          `currentMarketingActivity.${index}.workingAssessment`,
          activity.workingAssessment,
        );
      }
      await this.fill(`currentMarketingActivity.${index}.evidence`, activity.evidence);
      await this.fill(`currentMarketingActivity.${index}.monthlySpend`, activity.monthlySpend);
      await this.fill(`currentMarketingActivity.${index}.timeRunning`, activity.timeRunning);
      await this.fill(`currentMarketingActivity.${index}.reasonStopped`, activity.reasonStopped);
    }

    await this.fill('whatsWorking', step.whatsWorking);
    await this.fill('biggestFrustration', step.biggestFrustration);
    await this.fill('pastMarketing', step.pastMarketing);
    await this.addTags('knownCompetitors', step.knownCompetitors);
    await this.addTags('channelsToAvoid', step.channelsToAvoid);
    await this.addTags('channelsStronglyPreferred', step.channelsStronglyPreferred);
    await this.addTags('executionConstraints', step.executionConstraints);
    await this.fill('additionalContext', step.additionalContext);
    await this.saveStep(5, 'Continue');
  }

  async populateStep6() {
    const step = this.fixture.wizard.step6;
    for (const fieldPath of [
      'averageOrderValue',
      'averageContractValue',
      'grossMarginPercentage',
      'monthlyRevenue',
      'monthlyOrderVolume',
      'productCost',
      'monthlyOrdersPerSubscriber',
      'monthlyChurnRate',
      'salesCycleLength',
    ] as const) {
      await this.fill(fieldPath, step[fieldPath]);
    }
    if (step.avgCustomerRetention) {
      await this.chooseSelect('avgCustomerRetention', step.avgCustomerRetention);
    }
    if (step.repeatPurchaseFrequency) {
      await this.chooseSelect('repeatPurchaseFrequency', step.repeatPurchaseFrequency);
    }
    await this.saveStep(6, 'Review');
  }

  private reviewSection(name: string) {
    return this.page.getByTestId(
      `campaign-wizard-review-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    );
  }

  private async assertReviewContains(section: Locator, values: Array<string | undefined>) {
    for (const value of values) {
      if (value) {
        await expect(section.getByText(value, { exact: false }).first()).toBeVisible();
      }
    }
  }

  async validateReview() {
    const { step1, step2, step3, step5, step6 } = this.fixture.wizard;
    await this.assertReviewContains(this.reviewSection('Focus'), [
      step1.title,
      step1.focusName,
      ...step1.targetMarkets,
    ]);
    await this.assertReviewContains(this.reviewSection('Business'), [
      step2.businessName,
      step2.productCategory,
      ...step2.productsServices,
      step2.priceRange,
    ]);
    await this.assertReviewContains(this.reviewSection('Audience'), [
      step3.primaryTargetSegment,
      step3.targetPersona,
      ...step3.painPoints,
      step3.desiredOutcome,
    ]);
    await this.assertReviewContains(this.reviewSection('Goals & Context'), [
      step5.paidMediaBudgetRange,
      step5.salesCapacity,
      ...(step5.knownCompetitors ?? []),
    ]);
    await this.assertReviewContains(this.reviewSection('Economics'), [
      step6.averageOrderValue,
      step6.averageContractValue,
      step6.monthlyRevenue,
    ]);
  }

  private async setReviewCheckbox(testId: string, desired: boolean) {
    const checkbox = this.page.getByTestId(testId);
    await expect(checkbox).toBeVisible();
    const checked = await checkbox.isChecked();
    if (checked !== desired) {
      await checkbox.click();
    }
    if (desired) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }

  async confirmReview() {
    const step = this.fixture.wizard.step7;
    await this.setReviewCheckbox('wizard-confirm-focus', step.confirmFocus);
    await this.setReviewCheckbox('wizard-confirm-business', step.confirmBusiness);
    await this.setReviewCheckbox('wizard-confirm-audience', step.confirmAudience);
    await this.setReviewCheckbox('wizard-confirm-goals', step.confirmGoals);
    await this.setReviewCheckbox('wizard-confirm-economics', step.confirmEconomics);
    await this.setReviewCheckbox('wizard-ready-to-generate', step.readyToGenerate);

    for (const [testId, desired] of [
      ['wizard-consent-privacy-processing', step.privacyProcessingConsent],
      ['wizard-consent-ai-processing', step.aiProcessingConsent],
      ['wizard-consent-benchmark-data', step.dataConsentOptIn],
    ] as const) {
      const checkbox = this.page.getByTestId(testId);
      const current = await checkbox.isChecked();
      if (current !== desired) {
        const [consentResponse] = await Promise.all([
          this.page.waitForResponse((response) => {
            const pathname = responsePath(response);
            return (
              response.request().method() === 'POST' &&
              ['/api/v2/legal/consents/give', '/api/v2/legal/consents/withdraw'].includes(pathname)
            );
          }),
          checkbox.click(),
        ]);
        await this.requireOk(consentResponse, `legal-consent.${testId}`);
      }
      await this.setReviewCheckbox(testId, desired);
    }
  }

  async captureReviewOnly() {
    const screenshotPath = path.resolve(
      process.cwd(),
      'e2e',
      'results',
      'campaigns',
      `${this.fixture.slug}-final-review.png`,
    );
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.report.status = 'review-only';
    this.report.finalUrl = this.page.url();
    this.report.screenshot = screenshotPath;
  }

  async submit() {
    const commitResponsePromise = this.page.waitForResponse((response) =>
      isMutation(response, 'POST', '/api/v2/wizard/commit'),
    );
    await this.page.getByRole('button', { name: 'Generate Strategy', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Generate Strategy?', exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    const commitResponse = await commitResponsePromise;
    await this.requireOk(commitResponse, 'wizard.commit');
    const payload = await commitResponse.json();
    const data = payload?.data ?? payload;
    if (data?.commitAccepted !== true) {
      throw new Error('Wizard commit response did not report commitAccepted=true');
    }
    this.report.pipelineRunId = data?.pipelineRunId ?? data?.run?.runId;
    this.report.strategyId =
      data?.strategyId ?? data?.strategy?.id ?? data?.strategyRunId ?? undefined;
    await this.page.waitForURL((url) => {
      const campaignId = this.report.campaignId;
      return Boolean(campaignId && url.pathname.includes(`/app/campaigns/${campaignId}/`));
    });
    this.report.finalUrl = this.page.url();
    const screenshotPath = path.resolve(
      process.cwd(),
      'e2e',
      'results',
      'campaigns',
      `${this.fixture.slug}-submitted.png`,
    );
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.report.screenshot = screenshotPath;
    this.report.status = 'submitted';
  }
}
