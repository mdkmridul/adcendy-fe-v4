/**
 * The results page (backend STEP-4 results loop): a client records what they
 * spent and got back on each channel, month by month or week by week.
 *
 * Pure: period arithmetic, form-to-payload building, plain-language
 * formatting, and the same per-period metrics the backend derives (so the
 * in-memory mock agrees with the API). Type-only imports, so `node --test`
 * can run it directly.
 */

import type {
  ChannelResultFiguresV2,
  ChannelResultInputV2,
  ChannelResultMetricsV2,
  ChannelResultPeriodV2,
  ChannelResultSourceV2,
  ChannelResultSummaryV2,
  ChannelResultViewV2,
} from '@/shared/types/channelResultsV2';

/** Shown wherever a value was not reported or cannot be worked out. */
export const EMPTY_VALUE_V2 = '—';

export const CHANNEL_RESULT_NOTES_MAX_LENGTH_V2 = 2000;
export const OTHER_CHANNEL_ID_V2 = 'other';

const CHANNEL_ID_PATTERN_V2 = /^[a-z0-9_]{2,100}$/;
const CURRENCY_PATTERN_V2 = /^[A-Z]{3}$/;
const MONEY_MAX_V2 = 1_000_000_000_000;
const COUNT_MAX_V2 = 1_000_000_000;

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export interface ChannelOptionV2 {
  id: string;
  label: string;
}

/**
 * The backend channel registry (`config/pipeline-v2/domains/channels.v2.json`
 * in adcendy-be-v4), in registry order. The web app has no channel list of its
 * own and does not yet fetch a delivered plan's channel decisions, so this
 * mirrors the registry ids the plan itself uses. The API accepts any
 * lowercase snake_case id, so a channel added to the registry later still
 * saves as "Other" until it is added here.
 */
export const CHANNEL_OPTIONS_V2: readonly ChannelOptionV2[] = [
  { id: 'meta_ads', label: 'Meta Ads (Facebook + Instagram)' },
  { id: 'google_search_ads', label: 'Google Search Ads' },
  { id: 'youtube_ads', label: 'YouTube Ads' },
  { id: 'linkedin_ads', label: 'LinkedIn Ads' },
  { id: 'programmatic_display', label: 'Programmatic Display' },
  { id: 'native_ads', label: 'Native Ads' },
  { id: 'seo', label: 'SEO' },
  { id: 'content_marketing', label: 'Content Marketing' },
  { id: 'youtube_organic', label: 'YouTube Organic' },
  { id: 'linkedin_organic', label: 'LinkedIn Organic' },
  { id: 'email_marketing', label: 'Email Marketing' },
  { id: 'sms_marketing', label: 'SMS Marketing' },
  { id: 'referral_program', label: 'Referral Program' },
  { id: 'affiliate_marketing', label: 'Affiliate Marketing' },
  { id: 'influencer_marketing', label: 'Influencer Marketing' },
  { id: 'creator_whitelisting_ads', label: 'Creator Whitelisting Ads' },
  { id: 'podcast_ads', label: 'Podcast Ads' },
  { id: 'podcast_organic', label: 'Podcast Organic' },
  { id: 'webinars_virtual_events', label: 'Webinars and Virtual Events' },
  { id: 'community_slack_discord', label: 'Community (Slack/Discord)' },
  { id: 'cold_email_outreach', label: 'Cold Email Outreach' },
  { id: 'account_based_marketing', label: 'Account-Based Marketing' },
  { id: 'partner_co_marketing', label: 'Partner Co-Marketing' },
  { id: 'retargeting_display', label: 'Retargeting Display' },
  { id: 'conversion_rate_optimization', label: 'Conversion Rate Optimization' },
  { id: 'whatsapp_business_broadcasts', label: 'WhatsApp Business Broadcasts' },
  { id: 'click_to_whatsapp_ads', label: 'Click-to-WhatsApp Ads' },
  { id: 'sharechat_ads', label: 'ShareChat Ads' },
  { id: 'moj_creator_partnerships', label: 'Moj Creator Partnerships' },
  { id: 'josh_short_video_partnerships', label: 'Josh Short Video Partnerships' },
  { id: 'justdial', label: 'Justdial' },
  { id: 'sulekha', label: 'Sulekha' },
  { id: 'indiamart', label: 'IndiaMART' },
  { id: 'tradeindia', label: 'TradeIndia' },
  { id: 'flipkart_ads', label: 'Flipkart Ads' },
  { id: 'meesho_ads', label: 'Meesho Ads' },
  { id: 'myntra_ads', label: 'Myntra Ads' },
  { id: 'nykaa_ads', label: 'Nykaa Ads' },
  { id: 'ondc_promotions', label: 'ONDC Promotions' },
  { id: 'upi_cashback_promotions', label: 'UPI Cashback Promotions' },
  { id: 'regional_language_content', label: 'Regional Language Content' },
  { id: 'yelp_sponsored', label: 'Yelp Sponsored' },
  { id: 'nextdoor_ads', label: 'Nextdoor Ads' },
  { id: 'quora_ads', label: 'Quora Ads' },
  { id: 'stackoverflow_sponsor', label: 'Stack Overflow Sponsorship' },
  { id: 'trade_publication_sponsorships', label: 'Trade Publication Sponsorships' },
  { id: 'line_ads', label: 'LINE Ads' },
  { id: 'kakaotalk_ads', label: 'KakaoTalk Ads' },
  { id: 'mercadolibre_ads', label: 'Mercado Libre Ads' },
  { id: 'shopee_ads', label: 'Shopee Ads' },
];

const CHANNEL_LABELS_V2 = new Map(
  CHANNEL_OPTIONS_V2.map((option) => [option.id, option.label]),
);

function humanizeIdV2(value: string): string {
  const words = value.split('_').filter(Boolean).join(' ');
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : value;
}

/** A channel's human name; never the raw id, unless nothing better exists. */
export function channelLabelV2(channelId: string): string {
  if (channelId === OTHER_CHANNEL_ID_V2) return 'Other';
  return CHANNEL_LABELS_V2.get(channelId) ?? humanizeIdV2(channelId);
}

export interface ChannelChoicesV2 {
  /** Channels already reported on this campaign, offered first. */
  reported: ChannelOptionV2[];
  /** Every other registry channel, then "Other". */
  all: ChannelOptionV2[];
}

export function buildChannelChoicesV2(
  reportedChannelIds: readonly string[],
): ChannelChoicesV2 {
  const reported: ChannelOptionV2[] = [];
  const seen = new Set<string>([OTHER_CHANNEL_ID_V2]);
  for (const id of reportedChannelIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    reported.push({ id, label: channelLabelV2(id) });
  }
  return {
    reported,
    all: [
      ...CHANNEL_OPTIONS_V2.filter((option) => !seen.has(option.id)),
      { id: OTHER_CHANNEL_ID_V2, label: 'Other' },
    ],
  };
}

// ---------------------------------------------------------------------------
// Markets and currency
// ---------------------------------------------------------------------------

export interface MarketOptionV2 {
  code: string;
  label: string;
}

export const MARKET_OPTIONS_V2: readonly MarketOptionV2[] = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'SG', label: 'Singapore' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'PH', label: 'Philippines' },
  { code: 'TH', label: 'Thailand' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'BD', label: 'Bangladesh' },
  { code: 'LK', label: 'Sri Lanka' },
  { code: 'NP', label: 'Nepal' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'BR', label: 'Brazil' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'IE', label: 'Ireland' },
  { code: 'SE', label: 'Sweden' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
];

const MARKET_LABELS_V2 = new Map(
  MARKET_OPTIONS_V2.map((option) => [option.code, option.label]),
);

const MARKET_NAME_ALIASES_V2: Record<string, string> = {
  usa: 'US',
  'united states of america': 'US',
  america: 'US',
  uk: 'GB',
  'great britain': 'GB',
  britain: 'GB',
  england: 'GB',
  uae: 'AE',
  korea: 'KR',
  'republic of korea': 'KR',
  bharat: 'IN',
};

const MARKET_NAMES_V2 = new Map<string, string>([
  ...MARKET_OPTIONS_V2.map((option) => [option.label.toLowerCase(), option.code] as const),
  ...Object.entries(MARKET_NAME_ALIASES_V2),
]);

/**
 * A two-letter market code from what the campaign holds: target markets are
 * typed in the wizard, so they may be a code ("IN") or a name ("India").
 */
export function normalizeMarketCodeV2(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  const lowered = trimmed.toLowerCase();
  const named = MARKET_NAMES_V2.get(lowered);
  if (named) return named;
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

export function marketLabelV2(code: string): string {
  return MARKET_LABELS_V2.get(code) ?? code;
}

/** The campaign's markets as codes, primary market first, without repeats. */
export function campaignMarketCodesV2(campaign: {
  v2PrimaryMarket?: string | null;
  v2TargetMarkets?: string[] | null;
}): string[] {
  const codes: string[] = [];
  for (const value of [campaign.v2PrimaryMarket, ...(campaign.v2TargetMarkets ?? [])]) {
    const code = normalizeMarketCodeV2(value);
    if (code && !codes.includes(code)) codes.push(code);
  }
  return codes;
}

/** Market choices: the campaign's own markets first, then the common list. */
export function buildMarketOptionsV2(firstCodes: readonly string[]): MarketOptionV2[] {
  const options: MarketOptionV2[] = [];
  const seen = new Set<string>();
  for (const code of [...firstCodes, ...MARKET_OPTIONS_V2.map((option) => option.code)]) {
    if (!/^[A-Z]{2}$/.test(code) || seen.has(code)) continue;
    seen.add(code);
    options.push({ code, label: marketLabelV2(code) });
  }
  return options;
}

export function defaultCurrencyForMarketV2(market: string | null | undefined): string {
  return market === 'IN' ? 'INR' : 'USD';
}

// ---------------------------------------------------------------------------
// Periods
// ---------------------------------------------------------------------------

const MONTH_NAMES_V2 = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_SHORT_NAMES_V2 = MONTH_NAMES_V2.map((name) => name.slice(0, 3));

export const MONTH_OPTIONS_V2 = MONTH_NAMES_V2.map((label, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label,
}));

function parseIsoDateV2(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function toIsoDateV2(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Today as `YYYY-MM-DD`, in UTC: the backend reads a period start as UTC
 * midnight and refuses one that has not begun yet.
 */
export function todayIsoV2(now: Date = new Date()): string {
  return toIsoDateV2(now);
}

/** The 1st of the month holding `value` (`YYYY-MM` or `YYYY-MM-DD`). */
export function monthPeriodStartV2(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(trimmed);
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  if (match[3] !== undefined && !parseIsoDateV2(trimmed)) return null;
  return `${match[1]}-${match[2]}-01`;
}

export function monthPeriodStartFromPartsV2(year: string | number, month: string | number): string | null {
  return monthPeriodStartV2(`${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`);
}

/** The Monday of the week holding `value` (`YYYY-MM-DD`). */
export function weekPeriodStartV2(value: string): string | null {
  const date = parseIsoDateV2(value.trim());
  if (!date) return null;
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return toIsoDateV2(date);
}

export function periodStartForV2(period: ChannelResultPeriodV2, value: string): string | null {
  return period === 'week' ? weekPeriodStartV2(value) : monthPeriodStartV2(value);
}

/** The start of the current month or week. */
export function currentPeriodStartV2(period: ChannelResultPeriodV2, now: Date = new Date()): string {
  return periodStartForV2(period, todayIsoV2(now)) as string;
}

/** As the backend checks it: a month starts on the 1st, a week on a Monday. */
export function isValidPeriodStartV2(period: ChannelResultPeriodV2, value: string): boolean {
  const date = parseIsoDateV2(value);
  if (!date) return false;
  return period === 'week' ? date.getUTCDay() === 1 : date.getUTCDate() === 1;
}

export function isFuturePeriodStartV2(value: string, now: Date = new Date()): boolean {
  return value > todayIsoV2(now);
}

/**
 * Switching between month and week keeps the reader in the same place: the
 * month holding the chosen week, or the week holding the chosen month's 1st.
 */
export function convertPeriodStartV2(
  period: ChannelResultPeriodV2,
  currentStart: string,
  now: Date = new Date(),
): string {
  const converted = periodStartForV2(period, currentStart);
  if (!converted || isFuturePeriodStartV2(converted, now)) {
    return currentPeriodStartV2(period, now);
  }
  return converted;
}

/** Years offered by the month picker: this year and the five before it. */
export function monthPickerYearsV2(todayIso: string, extraYear?: string): string[] {
  const current = Number(todayIso.slice(0, 4));
  const years = Array.from({ length: 6 }, (_, index) => String(current - index));
  if (extraYear && /^\d{4}$/.test(extraYear) && !years.includes(extraYear)) {
    years.push(extraYear);
    years.sort((left, right) => right.localeCompare(left));
  }
  return years;
}

/** "March 2026" for a month, "Week of 2 Mar 2026" for a week. */
export function formatPeriodLabelV2(period: ChannelResultPeriodV2, periodStart: string): string {
  const date = parseIsoDateV2(periodStart);
  if (!date) return periodStart;
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  if (period === 'month') return `${MONTH_NAMES_V2[monthIndex]} ${year}`;
  return `Week of ${date.getUTCDate()} ${MONTH_SHORT_NAMES_V2[monthIndex]} ${year}`;
}

// ---------------------------------------------------------------------------
// Figures and the form
// ---------------------------------------------------------------------------

export type FigureKeyV2 = keyof ChannelResultFiguresV2;

export const FIGURE_FIELDS_V2: ReadonlyArray<{
  key: FigureKeyV2;
  label: string;
  kind: 'money' | 'count';
}> = [
  { key: 'spend', label: 'Spend', kind: 'money' },
  { key: 'impressions', label: 'Impressions', kind: 'count' },
  { key: 'clicks', label: 'Clicks', kind: 'count' },
  { key: 'leads', label: 'Leads', kind: 'count' },
  { key: 'orders', label: 'Orders', kind: 'count' },
  { key: 'revenue', label: 'Revenue', kind: 'money' },
];

/** Where the numbers came from, as the client says it. */
export type EntrySourceV2 = 'self' | 'platform';

/** Who is filling the form in: an admin's own entry is recorded as such. */
export type EnteredByV2 = 'client' | 'operator';

export interface ChannelResultFormValuesV2 {
  market: string;
  channelId: string;
  period: ChannelResultPeriodV2;
  periodStart: string;
  currency: string;
  spend: string;
  impressions: string;
  clicks: string;
  leads: string;
  orders: string;
  revenue: string;
  entrySource: EntrySourceV2;
  notes: string;
}

export type ChannelResultFormErrorsV2 = Partial<
  Record<keyof ChannelResultFormValuesV2 | 'figures', string>
>;

export function parseFigureV2(
  raw: string,
  kind: 'money' | 'count',
): { value: number | null; error: string | null } {
  const cleaned = raw.replace(/[\s,_₹$€£]/g, '');
  if (!cleaned) return { value: null, error: null };
  if (kind === 'count') {
    if (!/^\d+$/.test(cleaned)) {
      return { value: null, error: 'Enter a whole number, like 1200.' };
    }
    const value = Number(cleaned);
    return value > COUNT_MAX_V2
      ? { value: null, error: 'That number is too large.' }
      : { value, error: null };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return { value: null, error: 'Enter an amount, like 12500 or 12500.50.' };
  }
  const value = Number(cleaned);
  return value > MONEY_MAX_V2
    ? { value: null, error: 'That amount is too large.' }
    : { value, error: null };
}

export function emptyChannelResultFormValuesV2(
  seed: Partial<Pick<
    ChannelResultFormValuesV2,
    'market' | 'channelId' | 'period' | 'periodStart' | 'currency' | 'entrySource'
  >> = {},
  now: Date = new Date(),
): ChannelResultFormValuesV2 {
  const market = seed.market ?? '';
  const period = seed.period ?? 'month';
  return {
    market,
    channelId: seed.channelId ?? '',
    period,
    periodStart: seed.periodStart ?? currentPeriodStartV2(period, now),
    currency: seed.currency ?? defaultCurrencyForMarketV2(market || null),
    spend: '',
    impressions: '',
    clicks: '',
    leads: '',
    orders: '',
    revenue: '',
    entrySource: seed.entrySource ?? 'self',
    notes: '',
  };
}

/** A saved result back in the form, to change and re-submit the same period. */
export function resultToFormValuesV2(result: ChannelResultViewV2): ChannelResultFormValuesV2 {
  const figure = (value: number | null) => (value === null ? '' : String(value));
  return {
    market: result.market,
    channelId: result.channel_id,
    period: result.period,
    periodStart: result.period_start,
    currency: result.currency,
    spend: figure(result.spend),
    impressions: figure(result.impressions),
    clicks: figure(result.clicks),
    leads: figure(result.leads),
    orders: figure(result.orders),
    revenue: figure(result.revenue),
    entrySource: result.source === 'platform_export' ? 'platform' : 'self',
    notes: result.notes ?? '',
  };
}

export function toResultSourceV2(entrySource: EntrySourceV2, enteredBy: EnteredByV2): ChannelResultSourceV2 {
  if (entrySource === 'platform') return 'platform_export';
  return enteredBy === 'operator' ? 'operator_entered' : 'client_reported';
}

export type ChannelResultPayloadResultV2 =
  | { ok: true; payload: ChannelResultInputV2 }
  | { ok: false; errors: ChannelResultFormErrorsV2 };

/**
 * The strict PUT body, or plain-language reasons it cannot be sent. Checks
 * what the backend checks, because the backend's own 400 carries only a code.
 * Every figure is sent, blank ones as null, so a re-submitted period replaces
 * the old figures rather than keeping ones the client cleared.
 */
export function buildChannelResultPayloadV2(
  values: ChannelResultFormValuesV2,
  options: { enteredBy?: EnteredByV2; now?: Date } = {},
): ChannelResultPayloadResultV2 {
  const errors: ChannelResultFormErrorsV2 = {};
  const now = options.now ?? new Date();

  const market = normalizeMarketCodeV2(values.market);
  if (!market) errors.market = 'Choose the market these results are for.';

  const channelId = values.channelId.trim();
  if (!channelId) {
    errors.channelId = 'Choose a channel.';
  } else if (!CHANNEL_ID_PATTERN_V2.test(channelId)) {
    errors.channelId = 'Choose a channel from the list.';
  }

  const period = values.period;
  if (period !== 'month' && period !== 'week') {
    errors.period = 'Choose month or week.';
  } else if (!values.periodStart) {
    errors.periodStart = period === 'month' ? 'Choose the month.' : 'Choose a day in the week.';
  } else if (!isValidPeriodStartV2(period, values.periodStart)) {
    errors.periodStart =
      period === 'month'
        ? 'A month is recorded from its 1st day. Choose the month again.'
        : 'A week is recorded from its Monday. Choose the week again.';
  } else if (isFuturePeriodStartV2(values.periodStart, now)) {
    errors.periodStart = 'You can only record a period that has already started.';
  }

  const currency = values.currency.trim().toUpperCase();
  if (!CURRENCY_PATTERN_V2.test(currency)) {
    errors.currency = 'Enter a three-letter currency code, like INR or USD.';
  }

  const figures = {} as ChannelResultFiguresV2;
  let figureError = false;
  for (const field of FIGURE_FIELDS_V2) {
    const parsed = parseFigureV2(values[field.key], field.kind);
    figures[field.key] = parsed.value;
    if (parsed.error) {
      errors[field.key] = parsed.error;
      figureError = true;
    }
  }
  if (!figureError && FIGURE_FIELDS_V2.every((field) => figures[field.key] === null)) {
    errors.figures = 'Enter at least one figure, such as spend or leads.';
  }

  const notes = values.notes.trim();
  if (notes.length > CHANNEL_RESULT_NOTES_MAX_LENGTH_V2) {
    errors.notes = 'Keep notes under 2,000 characters.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    payload: {
      market: market as string,
      channelId,
      period,
      periodStart: values.periodStart,
      currency,
      ...figures,
      source: toResultSourceV2(values.entrySource, options.enteredBy ?? 'client'),
      notes: notes || null,
    },
  };
}

/** The saved result for the same market, channel and period, if there is one. */
export function findReportedPeriodV2(
  results: readonly ChannelResultViewV2[],
  values: Pick<ChannelResultFormValuesV2, 'market' | 'channelId' | 'period' | 'periodStart'>,
): ChannelResultViewV2 | null {
  const market = normalizeMarketCodeV2(values.market);
  return (
    results.find(
      (result) =>
        result.market === market &&
        result.channel_id === values.channelId &&
        result.period === values.period &&
        result.period_start === values.periodStart,
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// Formatting: "—" for anything missing, never 0 for a value that was null
// ---------------------------------------------------------------------------

function isNumberV2(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function localeForCurrencyV2(currency: string | null | undefined): string {
  return currency === 'INR' ? 'en-IN' : 'en-US';
}

export function formatMoneyV2(value: number | null | undefined, currency: string): string {
  if (!isNumberV2(value)) return EMPTY_VALUE_V2;
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  try {
    return new Intl.NumberFormat(localeForCurrencyV2(currency), {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return `${currency} ${formatCountV2(value)}`;
  }
}

export function formatCountV2(value: number | null | undefined, currency?: string): string {
  if (!isNumberV2(value)) return EMPTY_VALUE_V2;
  return new Intl.NumberFormat(localeForCurrencyV2(currency), {
    maximumFractionDigits: 2,
  }).format(value);
}

/** Revenue for each unit spent, e.g. "3.25x". */
export function formatReturnOnSpendV2(value: number | null | undefined): string {
  if (!isNumberV2(value)) return EMPTY_VALUE_V2;
  return `${value.toFixed(2)}x`;
}

export function formatResultSourceV2(source: ChannelResultSourceV2): string {
  if (source === 'platform_export') return "From an ad platform's report";
  if (source === 'operator_entered') return 'Entered by our team';
  return 'Entered by you';
}

/**
 * A plain-language message for a failed request. The backend's 400 for a bad
 * body carries a code (`INVALID_CHANNEL_RESULT_V2`), not a sentence, so codes
 * and validation dumps are replaced; a real sentence is shown as it is.
 */
export function describeChannelResultErrorV2(error: unknown): string {
  const value = (error && typeof error === 'object' ? error : {}) as {
    status?: number;
    message?: unknown;
    kind?: string;
  };
  const message = typeof value.message === 'string' ? value.message.trim() : '';
  const readable =
    message.length > 0 &&
    !/^[A-Z0-9_]+$/.test(message) &&
    !/validation failed/i.test(message);

  switch (value.status) {
    case 400:
    case 422:
      return readable
        ? message
        : 'Some of these details could not be saved. Check the period, channel and figures, then try again.';
    case 401:
      return 'Your session has ended. Sign in again to continue.';
    case 403:
      return "You don't have access to this campaign's results.";
    case 404:
      return "We couldn't find that campaign or result. Refresh the page and try again.";
    case 429:
      return 'Too many requests. Wait a moment and try again.';
    default:
      break;
  }
  if (typeof value.status === 'number' && value.status >= 500) {
    return 'Something went wrong on our side. Try again in a moment.';
  }
  if (value.kind === 'Network' || value.status === undefined) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return readable ? message : 'Something went wrong. Try again in a moment.';
}

// ---------------------------------------------------------------------------
// The backend's arithmetic, for the in-memory mock
// ---------------------------------------------------------------------------

const FIGURE_KEYS_V2: FigureKeyV2[] = FIGURE_FIELDS_V2.map((field) => field.key);

function ratioV2(numerator: number | null, denominator: number | null, scale = 1): number | null {
  return numerator === null || denominator === null || denominator <= 0
    ? null
    : Math.round((numerator / denominator) * scale * 100) / 100;
}

export function deriveChannelResultMetricsV2(figures: ChannelResultFiguresV2): ChannelResultMetricsV2 {
  return {
    cost_per_click: ratioV2(figures.spend, figures.clicks),
    cost_per_lead: ratioV2(figures.spend, figures.leads),
    cost_per_order: ratioV2(figures.spend, figures.orders),
    return_on_spend: ratioV2(figures.revenue, figures.spend),
    lead_to_order_rate_percent: ratioV2(figures.orders, figures.leads, 100),
    click_through_rate_percent: ratioV2(figures.clicks, figures.impressions, 100),
  };
}

/** Per market, channel and currency; currencies are never added together. */
export function summarizeChannelResultsV2(
  results: readonly ChannelResultViewV2[],
): ChannelResultSummaryV2[] {
  const groups = new Map<string, ChannelResultViewV2[]>();
  for (const result of results) {
    const key = [result.market, result.channel_id, result.currency].join('|');
    groups.set(key, [...(groups.get(key) ?? []), result]);
  }
  return [...groups.values()]
    .map((rows) => {
      const totals = Object.fromEntries(
        FIGURE_KEYS_V2.map((key) => {
          const reported = rows
            .map((row) => row[key])
            .filter((value): value is number => value !== null);
          return [
            key,
            reported.length === 0
              ? null
              : Math.round(reported.reduce((sum, value) => sum + value, 0) * 100) / 100,
          ];
        }),
      ) as unknown as ChannelResultFiguresV2;
      const starts = rows.map((row) => row.period_start).sort();
      return {
        market: rows[0].market,
        channel_id: rows[0].channel_id,
        currency: rows[0].currency,
        periods_reported: rows.length,
        first_period_start: starts[0],
        last_period_start: starts[starts.length - 1],
        totals,
        metrics: deriveChannelResultMetricsV2(totals),
      };
    })
    .sort(
      (left, right) =>
        left.market.localeCompare(right.market) ||
        left.channel_id.localeCompare(right.channel_id) ||
        left.currency.localeCompare(right.currency),
    );
}

// ---------------------------------------------------------------------------
// The campaign, from either view
// ---------------------------------------------------------------------------

/**
 * What the results page needs to know about a campaign. The client's own
 * workspace and the admin view load a campaign through different calls, so
 * each maps its answer to this.
 */
export interface ResultsCampaignV2 {
  title: string | null;
  status: string;
  ownerEmail: string | null;
  v2PrimaryMarket?: string | null;
  v2TargetMarkets?: string[] | null;
}

/** Results open once the plan is delivered: an active or archived campaign. */
export function resultsOpenForStatusV2(status: string | null | undefined): boolean {
  const normalized = (status ?? '').trim().toUpperCase();
  return normalized === 'ACTIVE' || normalized === 'ARCHIVED';
}

/**
 * The admin view's campaign: title, status and owner from the admin campaign
 * detail, markets from the campaign overview, which the detail does not carry.
 * Null until the detail has loaded.
 */
export function adminResultsCampaignV2(
  detail:
    | { campaign: { title: string; status: string; owner?: { email?: string | null } | null } }
    | null
    | undefined,
  overview: { v2PrimaryMarket?: string | null; v2TargetMarkets?: string[] | null } | null | undefined,
): ResultsCampaignV2 | null {
  if (!detail) return null;
  return {
    title: detail.campaign.title || null,
    status: detail.campaign.status,
    ownerEmail: detail.campaign.owner?.email ?? null,
    v2PrimaryMarket: overview?.v2PrimaryMarket ?? null,
    v2TargetMarkets: overview?.v2TargetMarkets ?? [],
  };
}
