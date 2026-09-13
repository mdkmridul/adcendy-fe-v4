import { ApiError } from '@/shared/api/errors';
import {
  deriveChannelResultMetricsV2,
  isFuturePeriodStartV2,
  isValidPeriodStartV2,
  summarizeChannelResultsV2,
} from '@/shared/components/results/channelResultsV2';
import type {
  ChannelResultDeleteV2,
  ChannelResultFiguresV2,
  ChannelResultInputV2,
  ChannelResultListFilterV2,
  ChannelResultListV2,
  ChannelResultViewV2,
} from '@/shared/types/channelResultsV2';

/** In-memory results per campaign, for local development only. */
const resultsByCampaign = new Map<string, ChannelResultViewV2[]>();

const LIST_LIMIT = 500;

function wait(milliseconds = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** The backend answers a bad body with a code, not a sentence. */
function invalidResult(): ApiError {
  return new ApiError({
    kind: 'Validation',
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'INVALID_CHANNEL_RESULT_V2',
  });
}

function newestFirst(left: ChannelResultViewV2, right: ChannelResultViewV2): number {
  return (
    right.period_start.localeCompare(left.period_start) ||
    left.channel_id.localeCompare(right.channel_id)
  );
}

export const channelResultsV2MockAdapter = {
  async record(
    campaignId: string,
    input: ChannelResultInputV2,
    signal?: AbortSignal,
  ): Promise<ChannelResultViewV2> {
    await wait();
    signal?.throwIfAborted();
    const market = input.market.trim().toUpperCase();
    const currency = input.currency.trim().toUpperCase();
    const figures: ChannelResultFiguresV2 = {
      spend: input.spend ?? null,
      impressions: input.impressions ?? null,
      clicks: input.clicks ?? null,
      leads: input.leads ?? null,
      orders: input.orders ?? null,
      revenue: input.revenue ?? null,
    };
    if (
      !/^[A-Z]{2}$/.test(market) ||
      !/^[A-Z]{3}$/.test(currency) ||
      !/^[a-z0-9_]{2,100}$/.test(input.channelId) ||
      !isValidPeriodStartV2(input.period, input.periodStart) ||
      isFuturePeriodStartV2(input.periodStart) ||
      Object.values(figures).every((figure) => figure === null)
    ) {
      throw invalidResult();
    }

    const existing = resultsByCampaign.get(campaignId) ?? [];
    const previous = existing.find(
      (result) =>
        result.market === market &&
        result.channel_id === input.channelId &&
        result.period === input.period &&
        result.period_start === input.periodStart,
    );
    const saved: ChannelResultViewV2 = {
      id: previous?.id ?? `mock-result-${Date.now()}-${existing.length}`,
      market,
      channel_id: input.channelId,
      period: input.period,
      period_start: input.periodStart,
      currency,
      ...figures,
      source: input.source ?? 'client_reported',
      notes: input.notes?.trim() || null,
      plan_run_id: null,
      metrics: deriveChannelResultMetricsV2(figures),
      updated_at: new Date().toISOString(),
    };
    resultsByCampaign.set(campaignId, [
      ...existing.filter((result) => result.id !== saved.id),
      saved,
    ]);
    return saved;
  },

  async list(
    campaignId: string,
    filter?: ChannelResultListFilterV2,
    signal?: AbortSignal,
  ): Promise<ChannelResultListV2> {
    await wait();
    signal?.throwIfAborted();
    const market = filter?.market?.trim().toUpperCase() || null;
    const channelId = filter?.channelId?.trim() || null;
    const results = (resultsByCampaign.get(campaignId) ?? [])
      .filter((result) => !market || result.market === market)
      .filter((result) => !channelId || result.channel_id === channelId)
      .sort(newestFirst)
      .slice(0, LIST_LIMIT);
    return {
      campaign_id: campaignId,
      results,
      by_channel: summarizeChannelResultsV2(results),
    };
  },

  async remove(
    campaignId: string,
    resultId: string,
    signal?: AbortSignal,
  ): Promise<ChannelResultDeleteV2> {
    await wait();
    signal?.throwIfAborted();
    const existing = resultsByCampaign.get(campaignId) ?? [];
    if (!existing.some((result) => result.id === resultId)) {
      throw new ApiError({
        kind: 'NotFound',
        status: 404,
        code: 'NOT_FOUND',
        message: 'Channel result not found',
      });
    }
    resultsByCampaign.set(
      campaignId,
      existing.filter((result) => result.id !== resultId),
    );
    return { deleted: true, id: resultId };
  },
};
