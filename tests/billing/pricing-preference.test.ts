import test from "node:test";
import assert from "node:assert/strict";
import { billingMockAdapter } from "../../shared/api/mock/billing.mock.ts";
import {
  INDIAN_PAYMENT_REFUND_MESSAGE,
  INR_PRICE_REQUIRES_INDIAN_PAYMENT,
  isIndianPaymentRefund,
  pricingSwitchFor,
  requestedCountryFor,
} from "../../shared/payments/pricingPreference.ts";

// Backend R-8: the server decides which prices a buyer sees; the page only
// switches explicitly, and India's price is checked at payment.

test("sends no country until the buyer switches, so the server decides", () => {
  assert.equal(requestedCountryFor("auto"), undefined);
  assert.equal(requestedCountryFor("IN"), "IN");
  assert.equal(requestedCountryFor("US"), "US");
});

test("offers the other market's price, going by what the server returned", () => {
  assert.deepEqual(pricingSwitchFor("USD"), {
    label: "In India? See INR prices",
    preference: "IN",
  });
  assert.deepEqual(pricingSwitchFor("INR"), {
    label: "Not in India? See USD prices",
    preference: "US",
  });
  // Nothing to switch from until the prices have loaded.
  assert.equal(pricingSwitchFor(undefined), null);
});

test("recognises an India-priced order refunded for a payment from abroad", () => {
  assert.equal(
    isIndianPaymentRefund({ refundReason: INR_PRICE_REQUIRES_INDIAN_PAYMENT }),
    true,
  );
  assert.equal(isIndianPaymentRefund({ refundReason: null }), false);
  assert.equal(isIndianPaymentRefund({}), false);
  assert.equal(isIndianPaymentRefund(null), false);
});

test("tells the buyer why they were refunded and what they can pay instead", () => {
  assert.match(INDIAN_PAYMENT_REFUND_MESSAGE, /payments made in India/);
  assert.match(INDIAN_PAYMENT_REFUND_MESSAGE, /refunded/);
  assert.match(INDIAN_PAYMENT_REFUND_MESSAGE, /USD price/);
});

test("with no country chosen, prices come back in USD, as they do with no Cloudflare header", async () => {
  const landing = await billingMockAdapter.listPublicBundles();
  const checkout = await billingMockAdapter.listBundles();

  assert.equal(landing.currency, "USD");
  assert.deepEqual(landing, checkout);
});

test("a new order starts with no refund reason", async () => {
  const order = await billingMockAdapter.createOrder(
    "GEN_1",
    "pricing-preference-idempotency",
  );
  assert.equal(order.refundReason, null);
  assert.equal(order.currency, "USD");
});
