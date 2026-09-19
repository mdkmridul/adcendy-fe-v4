/**
 * Which prices a buyer sees (backend R-8).
 *
 * The server decides by default, from the visitor's country as Cloudflare
 * reports it; the page no longer guesses from localStorage or the browser
 * language. A buyer can still switch explicitly: India's price is checked at
 * payment, and the international price is full price, so neither switch can
 * be used to pay less than the payment allows.
 */

/** "auto" lets the server decide; the others are an explicit switch. */
export type PricingPreference = "auto" | "IN" | "US";

/** The reason the server gives when it refunds an India-priced order. */
export const INR_PRICE_REQUIRES_INDIAN_PAYMENT =
  "INR_PRICE_REQUIRES_INDIAN_PAYMENT" as const;

export type BillingRefundReason = typeof INR_PRICE_REQUIRES_INDIAN_PAYMENT;

export const INDIAN_PAYMENT_REFUND_MESSAGE =
  "INR pricing is for payments made in India. You've been refunded. Here's the USD price.";

/** What to send the server: nothing lets it decide from the visitor's country. */
export function requestedCountryFor(
  preference: PricingPreference,
): string | undefined {
  return preference === "auto" ? undefined : preference;
}

/**
 * The switch to offer, from the currency the server actually returned rather
 * than from what the page asked for.
 */
export function pricingSwitchFor(currency: string | undefined): {
  label: string;
  preference: PricingPreference;
} | null {
  if (!currency) return null;
  return currency.toUpperCase() === "INR"
    ? { label: "Not in India? See USD prices", preference: "US" }
    : { label: "In India? See INR prices", preference: "IN" };
}

/** Whether an order is being refunded because it needed an Indian payment. */
export function isIndianPaymentRefund(
  order: { refundReason?: string | null } | null | undefined,
): boolean {
  return order?.refundReason === INR_PRICE_REQUIRES_INDIAN_PAYMENT;
}
