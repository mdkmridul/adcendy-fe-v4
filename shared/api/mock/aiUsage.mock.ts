import type { AiUsageSummary, GetAiUsageSummaryParams, AiDailyUsage, AiTopSpender } from '@/shared/types/aiUsage';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateDailyUsage(windowDays: number): AiDailyUsage[] {
  const daily: AiDailyUsage[] = [];
  const today = new Date();

  for (let i = windowDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic varying daily usage
    const baseRequests = 180 + Math.floor(Math.random() * 100);
    const baseTokens = 85000 + Math.floor(Math.random() * 40000);
    const costPerToken = 0.000003; // $3 per million tokens (Claude Sonnet pricing)

    daily.push({
      date: dateStr,
      totalRequests: baseRequests,
      totalTokens: baseTokens,
      totalCostUsd: parseFloat((baseTokens * costPerToken).toFixed(2)),
    });
  }

  return daily;
}

const mockTopSpenders: AiTopSpender[] = [
  {
    entityType: 'CAMPAIGN',
    entityId: 'campaign-001',
    label: 'Tech Startup SaaS - San Francisco',
    totalCostUsd: 145.32,
    totalTokens: 48440000,
    totalRequests: 1250,
  },
  {
    entityType: 'CAMPAIGN',
    entityId: 'campaign-002',
    label: 'E-commerce Fashion - New York',
    totalCostUsd: 98.67,
    totalTokens: 32890000,
    totalRequests: 850,
  },
  {
    entityType: 'CAMPAIGN',
    entityId: 'campaign-003',
    label: 'Healthcare Provider - Boston',
    totalCostUsd: 76.23,
    totalTokens: 25410000,
    totalRequests: 620,
  },
  {
    entityType: 'CAMPAIGN',
    entityId: 'campaign-004',
    label: 'Financial Services - Chicago',
    totalCostUsd: 62.45,
    totalTokens: 20816667,
    totalRequests: 480,
  },
  {
    entityType: 'USER',
    entityId: 'user-001',
    label: 'admin@adcendy.com',
    totalCostUsd: 38.90,
    totalTokens: 12966667,
    totalRequests: 320,
  },
  {
    entityType: 'CAMPAIGN',
    entityId: 'campaign-005',
    label: 'Real Estate - Miami',
    totalCostUsd: 34.12,
    totalTokens: 11373333,
    totalRequests: 280,
  },
  {
    entityType: 'USER',
    entityId: 'user-002',
    label: 'reviewer@adcendy.com',
    totalCostUsd: 18.45,
    totalTokens: 6150000,
    totalRequests: 150,
  },
];

export const aiUsageMockAdapter = {
  async getAiUsageSummary(params?: GetAiUsageSummaryParams): Promise<AiUsageSummary> {
    await delay(200);

    const windowDays = params?.windowDays || 14;
    const daily = generateDailyUsage(windowDays);

    // Filter top spenders proportionally to window
    const spenderMultiplier = windowDays / 30; // Scale based on 30-day baseline
    const adjustedSpenders = mockTopSpenders.map(spender => ({
      ...spender,
      totalCostUsd: parseFloat((spender.totalCostUsd * spenderMultiplier).toFixed(2)),
      totalTokens: Math.floor(spender.totalTokens * spenderMultiplier),
      totalRequests: Math.floor(spender.totalRequests * spenderMultiplier),
    }));

    return {
      windowDays,
      daily,
      topSpenders: adjustedSpenders,
    };
  },
};
