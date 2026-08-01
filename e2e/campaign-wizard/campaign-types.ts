export interface CampaignFixture {
  fixtureVersion: '1.0';
  fixtureStatus: 'placeholder' | 'ready';
  slug: string;
  displayName: string;
  wizard: {
    step1: Record<string, unknown> & {
      title?: string;
      marketingTargetType: string;
      focusName: string;
      sourceType: string;
      primaryUrl?: string;
      targetMarkets: string[];
      primaryMarket?: string;
      marketScope: string;
      operationalLocations?: string[];
      regionalLanguageExpansionEnabled?: boolean;
      regionalLanguages?: string[];
    };
    step2: Record<string, unknown> & {
      businessName?: string;
      industryCategory: string;
      businessModel: string;
      audienceModel: string;
      lifecycleStage: string;
      businessDescription: string;
      productCategory: string;
      productsServices: string[];
      offerSummary?: string;
      priceRange: string;
      differentiators?: string[];
      sensitiveCategoryFlags: string[];
      complianceSensitiveClaims?: string[];
    };
    step3: Record<string, unknown> & {
      primaryTargetSegment: string;
      targetPersona: string;
      targetAudience?: string;
      audienceSegments?: string[];
      language: string;
      reportLanguage?: string;
      painPoints: string[];
      desiredOutcome: string;
      decisionProcess: string;
      buyerRoles?: string[];
    };
    step4: Record<string, unknown> & {
      salesChannels: Array<{ channel: string; rank: number; customName?: string }>;
      primaryConversionPath: string;
      trustSignals?: string[];
      socialHandles?: Array<{ platform: string; handle: string }>;
      digitalPresenceLinks?: Array<{ type: string; url: string; label?: string }>;
      googleAnalyticsConnected?: boolean | 'unknown' | '';
      monthlyWebsiteTraffic?: string;
      emailListSize?: string;
    };
    step5: Record<string, unknown> & {
      primaryGoal: string;
      monthlyMarketingSpend: string;
      paidMediaBudgetRange: string;
      marketingHandler: string;
      contentCapacity: string;
      salesCapacity?: string;
      currentMarketingActivity?: Array<{
        channel: string;
        status: string;
        workingAssessment?: string;
        evidence?: string;
        monthlySpend?: string;
        timeRunning?: string;
        reasonStopped?: string;
      }>;
      pastMarketing?: string;
      whatsWorking?: string;
      biggestFrustration?: string;
      knownCompetitorStatus: string;
      knownCompetitors?: string[];
      constraints?: string[];
      channelsToAvoid?: string[];
      channelsStronglyPreferred?: string[];
      executionConstraints?: string[];
      additionalContext?: string;
    };
    step6: Record<string, unknown> & {
      averageOrderValue?: string;
      averageContractValue?: string;
      grossMarginPercentage?: string;
      monthlyRevenue?: string;
      monthlyOrderVolume?: string;
      productCost?: string;
      monthlyOrdersPerSubscriber?: string;
      monthlyChurnRate?: string;
      avgCustomerRetention?: string;
      repeatPurchaseFrequency?: string;
      salesCycleLength?: string;
    };
    step7: {
      confirmFocus: true;
      confirmBusiness: true;
      confirmAudience: true;
      confirmGoals: true;
      confirmEconomics: true;
      readyToGenerate: true;
      dataConsentOptIn: boolean;
      privacyProcessingConsent: true;
      aiProcessingConsent: true;
    };
  };
}

export interface CampaignExecutionReport {
  fixture: string;
  displayName: string;
  environment: 'local' | 'uat';
  baseURL: string;
  submitEnabled: boolean;
  status: 'running' | 'review-only' | 'submitted' | 'failed';
  startedAt: string;
  completedAt?: string;
  campaignId?: string;
  strategyId?: string;
  pipelineRunId?: string;
  finalUrl?: string;
  screenshot?: string;
  validationFailures: Array<{ path: string; message: string }>;
  unsupportedFields: Array<{ path: string; message: string }>;
  error?: string;
}
