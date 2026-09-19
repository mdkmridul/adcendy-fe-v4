/**
 * Which prices a buyer sees (backend R-8).
 *
 * The server decides, by location alone: the visitor's country as Cloudflare
 * reports it, USD when it cannot tell. The page sends no country and offers
 * no switch (operator ruling 2026-09-19). India's price is checked at
 * payment, so appearing to be in India is not enough to pay it.
 */

/** The reason the server gives when it refunds an India-priced order. */
export const INR_PRICE_REQUIRES_INDIAN_PAYMENT =
  "INR_PRICE_REQUIRES_INDIAN_PAYMENT" as const;

export type BillingRefundReason = typeof INR_PRICE_REQUIRES_INDIAN_PAYMENT;

// With prices following location alone, a buyer in India cannot be offered
// USD instead, so the message says how to pay rather than promising it.
export const INDIAN_PAYMENT_REFUND_MESSAGE =
  "INR pricing is for payments made in India. You've been refunded. Please pay with UPI, Indian netbanking or an Indian-issued card.";

/** Whether an order is being refunded because it needed an Indian payment. */
export function isIndianPaymentRefund(
  order: { refundReason?: string | null } | null | undefined,
): boolean {
  return order?.refundReason === INR_PRICE_REQUIRES_INDIAN_PAYMENT;
}
