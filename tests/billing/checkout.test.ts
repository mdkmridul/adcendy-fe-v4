import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { billingMockAdapter } from "../../shared/api/mock/billing.mock.ts";
import { formatMinorAmount } from "../../shared/payments/razorpay.ts";

const LANDING_DEFAULT_COUNTRY = "US";

test("formats server amounts from paise without changing their value", () => {
  assert.equal(
    formatMinorAmount({ amountMinor: 19900, currency: "INR" }),
    "₹199.00",
  );
});

test("mock checkout keeps the order identity and transitions it to paid", async () => {
  const order = await billingMockAdapter.createOrder(
    "GEN_5",
    "checkout-test-idempotency",
    "IN",
  );
  assert.equal(order.status, "CREATED");
  assert.equal(order.amountMinor, 79900);

  const result = await billingMockAdapter.verifyPayment(order.orderId, {
    providerOrderId: order.providerOrderId!,
    providerPaymentId: "pay_test123",
    signature: "0".repeat(64),
  });

  assert.equal(result.verified, true);
  assert.equal(result.order.status, "PAID");
  assert.equal(result.order.credits, 5);
  assert.equal(
    (await billingMockAdapter.getOrder(order.orderId)).status,
    "PAID",
  );
});

test("India stays on INR and an unconfigured country uses the US/USD fallback", async () => {
  const india = await billingMockAdapter.listBundles("IN");
  const canada = await billingMockAdapter.listBundles("CA");

  assert.equal(india.pricingCountryCode, "IN");
  assert.equal(india.currency, "INR");
  assert.equal(india.fallbackApplied, false);
  assert.equal(canada.pricingCountryCode, "US");
  assert.equal(canada.currency, "USD");
  assert.equal(canada.fallbackApplied, true);
});

test("public landing prices use the same catalogue as authenticated checkout", async () => {
  const landing = await billingMockAdapter.listPublicBundles(
    LANDING_DEFAULT_COUNTRY,
  );
  const checkout = await billingMockAdapter.listBundles(
    LANDING_DEFAULT_COUNTRY,
  );

  assert.deepEqual(landing, checkout);
  assert.equal(landing.pricingCountryCode, "US");
  assert.equal(landing.currency, "USD");
  assert.deepEqual(
    landing.items.map(({ credits, amountMinor, currency }) => ({
      credits,
      amountMinor,
      currency,
    })),
    [
      { credits: 1, amountMinor: 299, currency: "USD" },
      { credits: 5, amountMinor: 999, currency: "USD" },
      { credits: 11, amountMinor: 1799, currency: "USD" },
    ],
  );
});

test("frontend CSP permits the Razorpay-hosted Standard Checkout only over HTTPS", async () => {
  const { default: nextConfig } = await import("../../next.config.mjs");
  assert.ok(nextConfig.headers);
  const headers = await nextConfig.headers();
  const appHeaders =
    headers.find((entry) => entry.source === "/:path*")?.headers ?? [];
  const csp =
    appHeaders.find((header) => header.key === "Content-Security-Policy")
      ?.value ?? "";

  assert.match(csp, /script-src[^;]*https:\/\/checkout\.razorpay\.com/);
  assert.match(csp, /frame-src https:\/\/\*\.razorpay\.com/);
  assert.doesNotMatch(csp, /http:\/\/.*razorpay/);
});

test("a captured payment refreshes entitlement and returns to the main dashboard", () => {
  const checkoutPage = readFileSync(
    new URL("../../app/(app)/app/checkout/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(checkoutPage, /displayedOrder\?\.status !== "PAID"/);
  assert.match(checkoutPage, /queryKeys\.profile\.me\(\)/);
  assert.match(checkoutPage, /router\.replace\("\/app"\)/);
});
