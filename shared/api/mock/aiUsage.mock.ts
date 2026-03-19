import type {
  AiDailyUsage,
  AiUsageSummary,
  GetAiDailyUsageParams,
  GetAiUsageSummaryParams,
} from '@/shared/types/aiUsage';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildDailyUsage(days: number): AiDailyUsage[] {
  const today = new Date();
  const rows: AiDailyUsage[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    const calls = 40 + Math.floor(Math.random() * 35);
    const totalTokens = 120000 + Math.floor(Math.random() * 40000);
    const cost = Number((totalTokens / 1_000_000 * 1.9).toFixed(2));

    rows.push({
      id: `usage-${date.toISOString()}`,
      date: date.toISOString(),
      calls,
      totalTokens,
      cost,
      byOperationJson: {
        CHAT: {
          calls,
          tokens: totalTokens,
          cost,
        },
      },
      byModelJson: {
        'gpt-5': {
          calls,
          tokens: totalTokens,
          cost,
        },
      },
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  return rows;
}

export const aiUsageMockAdapter = {
  async getAiUsageSummary(params?: GetAiUsageSummaryParams): Promise<AiUsageSummary> {
    await delay(160);
    const days = params?.days ?? 14;
    const daily = buildDailyUsage(days);

    return {
      totalCalls: daily.reduce((sum, row) => sum + row.calls, 0),
      totalTokens: daily.reduce((sum, row) => sum + row.totalTokens, 0),
      totalCost: Number(daily.reduce((sum, row) => sum + row.cost, 0).toFixed(2)),
      grouped: {
        CHAT: {
          calls: daily.reduce((sum, row) => sum + row.calls, 0),
          tokens: daily.reduce((sum, row) => sum + row.totalTokens, 0),
          cost: Number(daily.reduce((sum, row) => sum + row.cost, 0).toFixed(2)),
        },
      },
    };
  },

  async getDailyUsage(params?: GetAiDailyUsageParams): Promise<AiDailyUsage[]> {
    await delay(140);
    return buildDailyUsage(params?.days ?? 14).slice(0, params?.limit ?? 14);
  },
};
