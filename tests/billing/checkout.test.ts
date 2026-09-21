import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { billingMockAdapter } from "../../shared/api/mock/billing.mock.ts";
import { formatMinorAmount } from "../../shared/payments/razorpay.ts";
import {
  isPilotCatalogue,
  marketCountDescription,
  marketCountLabel,
} from "../../shared/payments/market-catalogue.ts";

const LANDING_DEFAULT_COUNTRY = "US";

test("formats server amounts from paise without changing their value", () => {
  assert.equal(
    formatMinorAmount({ amountMinor: 19900, currency: "INR" }),
    "₹199.00",
  );
});

test("mock checkout keeps the order identity and transitions it to paid", async () => {
  const order = await billingMockAdapter.createOrder(
    "5 Markets",
    "checkout-test-idempotency",
    "US",
  );
  assert.equal(order.status, "CREATED");
  assert.equal(order.amountMinor, 225000);

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
      { credits: 1, amountMinor: 60000, currency: "USD" },
      { credits: 2, amountMinor: 108000, currency: "USD" },
      { credits: 3, amountMinor: 153000, currency: "USD" },
      { credits: 4, amountMinor: 192000, currency: "USD" },
      { credits: 5, amountMinor: 225000, currency: "USD" },
    ],
  );
});

test("a SKU's credits are spoken about as markets, never as credits", () => {
  assert.equal(marketCountLabel(1), "One market");
  assert.equal(marketCountLabel(5), "5 markets");
  assert.equal(
    marketCountDescription(1),
    "One country, one strategy, end to end.",
  );
  assert.match(marketCountDescription(11), /^11 countries/);

  for (const credits of [1, 2, 5]) {
    assert.doesNotMatch(marketCountLabel(credits), /credit/i);
    assert.doesNotMatch(marketCountDescription(credits), /credit/i);
  }
});

test("the landing lists every package the server priced, however many that is", async () => {
  // The page renders one card per catalogue item, in the server's order. How
  // many there are is the server's call: India lists a single package, other
  // countries several, and neither shape is special-cased on the frontend.
  const india = await billingMockAdapter.listPublicBundles("IN");
  const us = await billingMockAdapter.listPublicBundles(
    LANDING_DEFAULT_COUNTRY,
  );

  assert.deepEqual(
    india.items.map((item) => marketCountLabel(item.credits)),
    ["One market"],
  );
  assert.deepEqual(
    us.items.map((item) => marketCountLabel(item.credits)),
    ["One market", "2 markets", "3 markets", "4 markets", "5 markets"],
  );
});

test("pilot pricing shows only when the server says the pilot is on", () => {
  assert.equal(isPilotCatalogue({ pilot: true }), true);
  // Anything short of an explicit true removes the pilot from the page —
  // including a catalogue that has not loaded, or one that never says.
  assert.equal(isPilotCatalogue({ pilot: false }), false);
  assert.equal(isPilotCatalogue({}), false);
  assert.equal(isPilotCatalogue(undefined), false);
});

test("today's catalogue carries no pilot flag, so the pilot is off", async () => {
  const catalogue = await billingMockAdapter.listPublicBundles(
    LANDING_DEFAULT_COUNTRY,
  );
  assert.equal(isPilotCatalogue(catalogue), false);
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
