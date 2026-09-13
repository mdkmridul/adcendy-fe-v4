/**
 * Channel results (backend STEP-4 results loop): what a client actually spent
 * and got back on each marketing channel, per month or per week.
 *
 * Mirrors `GET|PUT|DELETE /api/v2/channel-results/...`. Response fields are
 * snake_case, as the API sends them; the request body is camelCase.
 */

export type ChannelResultPeriodV2 = 'week' | 'month';

export type ChannelResultSourceV2 =
  | 'client_reported'
  | 'operator_entered'
  | 'platform_export';

export interface ChannelResultFiguresV2 {
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  leads: number | null;
  orders: number | null;
  revenue: number | null;
}

export interface ChannelResultMetricsV2 {
  cost_per_click: number | null;
  cost_per_lead: number | null;
  cost_per_order: number | null;
  /** Revenue for each unit of spend. */
  return_on_spend: number | null;
  lead_to_order_rate_percent: number | null;
  click_through_rate_percent: number | null;
}

export interface ChannelResultViewV2 extends ChannelResultFiguresV2 {
  id: string;
  market: string;
  channel_id: string;
  period: ChannelResultPeriodV2;
  /** `YYYY-MM-DD`: the 1st for a month, a Monday for a week. */
  period_start: string;
  currency: string;
  source: ChannelResultSourceV2;
  notes: string | null;
  /** The plan in force when the period ended, when there was one. */
  plan_run_id: string | null;
  metrics: ChannelResultMetricsV2;
  updated_at: string;
}

export interface ChannelResultSummaryV2 {
  market: string;
  channel_id: string;
  currency: string;
  periods_reported: number;
  first_period_start: string;
  last_period_start: string;
  /** Sums of what was reported; a figure no period reported stays null. */
  totals: ChannelResultFiguresV2;
  metrics: ChannelResultMetricsV2;
}

export interface ChannelResultListV2 {
  campaign_id: string;
  /** Newest period first, at most 500. */
  results: ChannelResultViewV2[];
  /** Grouped by market, channel and currency: currencies are never added together. */
  by_channel: ChannelResultSummaryV2[];
}

export interface ChannelResultListFilterV2 {
  market?: string;
  channelId?: string;
}

/** The strict PUT body. No other keys are accepted. */
export interface ChannelResultInputV2 {
  market: string;
  channelId: string;
  period: ChannelResultPeriodV2;
  periodStart: string;
  currency: string;
  spend?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  leads?: number | null;
  orders?: number | null;
  revenue?: number | null;
  source?: ChannelResultSourceV2;
  notes?: string | null;
}

export interface ChannelResultDeleteV2 {
  deleted: true;
  id: string;
}
