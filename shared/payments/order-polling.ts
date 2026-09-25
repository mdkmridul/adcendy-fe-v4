/**
 * How long checkout keeps asking whether Razorpay has confirmed a payment.
 * Capture is usually confirmed within seconds; the backoff keeps a slow
 * webhook from turning one open tab into a steady stream of requests, and
 * the cap hands the wait back to the buyer instead of polling forever.
 */
export const ORDER_POLL_INITIAL_DELAY_MS = 2_000;
export const ORDER_POLL_MAX_DELAY_MS = 15_000;
export const ORDER_POLL_MAX_ATTEMPTS = 20;

/** Delay before poll number `attempt` (0-based), or false once the cap is reached. */
export function nextOrderPollDelay(attempt: number): number | false {
  if (!Number.isInteger(attempt) || attempt < 0 || attempt >= ORDER_POLL_MAX_ATTEMPTS) {
    return false;
  }
  return Math.min(ORDER_POLL_MAX_DELAY_MS, ORDER_POLL_INITIAL_DELAY_MS * 2 ** attempt);
}

export function isOrderAwaitingCapture(status: string | undefined): boolean {
  return !status || status === 'CREATED' || status === 'PENDING';
}
