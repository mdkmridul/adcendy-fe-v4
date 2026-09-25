/**
 * The locale whose digit grouping a buyer expects for a currency: lakh and
 * crore for rupees, thousands everywhere else. Formatting a dollar price with
 * `en-IN` prints $1,08,000 instead of $108,000.
 */
const CURRENCY_NUMBER_LOCALES: Readonly<Record<string, string>> = {
  INR: 'en-IN',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'en-IE',
};

const DEFAULT_NUMBER_LOCALE = 'en-US';

export function numberLocaleForCurrency(currency: string | null | undefined): string {
  return CURRENCY_NUMBER_LOCALES[(currency ?? '').trim().toUpperCase()] ?? DEFAULT_NUMBER_LOCALE;
}
