import test from "node:test";
import assert from "node:assert/strict";
import { billingMockAdapter } from "../../shared/api/mock/billing.mock.ts";
import {
  INDIAN_PAYMENT_REFUND_MESSAGE,
  INR_PRICE_REQUIRES_INDIAN_PAYMENT,
  isIndianPaymentRefund,
} from "../../shared/payments/pricingPreference.ts";

// Backend R-8: prices follow the visitor's location alone, with no switch,
// and India's price is checked at payment.

test("recognises an India-priced order refunded for a payment from abroad", () => {
  assert.equal(
    isIndianPaymentRefund({ refundReason: INR_PRICE_REQUIRES_INDIAN_PAYMENT }),
    true,
  );
  assert.equal(isIndianPaymentRefund({ refundReason: null }), false);
  assert.equal(isIndianPaymentRefund({}), false);
  assert.equal(isIndianPaymentRefund(null), false);
});

test("tells the buyer why they were refunded and how they can pay", () => {
  assert.match(INDIAN_PAYMENT_REFUND_MESSAGE, /payments made in India/);
  assert.match(INDIAN_PAYMENT_REFUND_MESSAGE, /refunded/);
  assert.match(INDIAN_PAYMENT_REFUND_MESSAGE, /UPI/);
  // A buyer in India cannot be shown USD, so the message must not offer it.
  assert.doesNotMatch(INDIAN_PAYMENT_REFUND_MESSAGE, /USD/);
});

test("with no location, prices come back in USD, as they do with no Cloudflare header", async () => {
  const landing = await billingMockAdapter.listPublicBundles();
  const checkout = await billingMockAdapter.listBundles();

  assert.equal(landing.currency, "USD");
  assert.deepEqual(landing, checkout);
});

test("a new order starts with no refund reason", async () => {
  const order = await billingMockAdapter.createOrder(
    "Launch",
    "pricing-preference-idempotency",
  );
  assert.equal(order.refundReason, null);
  assert.equal(order.currency, "USD");
});
