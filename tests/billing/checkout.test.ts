import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { billingMockAdapter } from "../../shared/api/mock/billing.mock.ts";
import { formatMinorAmount } from "../../shared/payments/razorpay.ts";
import {
  bundleOriginalPrice,
  isPilotCatalogue,
  marketCountDescription,
  marketCountLabel,
  pilotSeatsLabel,
  priceGroupHeading,
  separatePilotPackages,
  splitPilotCatalogue,
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
    ["doc-terms"],
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
      { credits: 1, amountMinor: 49900, currency: "USD" },
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
    ["One market", "One market"],
  );
  assert.deepEqual(
    us.items.map((item) => marketCountLabel(item.credits)),
    [
      "One market",
      "One market",
      "2 markets",
      "3 markets",
      "4 markets",
      "5 markets",
    ],
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

test("the pilot sells beside the regular packages, not instead of them", async () => {
  const catalogue = await billingMockAdapter.listPublicBundles(
    LANDING_DEFAULT_COUNTRY,
  );
  assert.equal(isPilotCatalogue(catalogue), true);
  assert.deepEqual(
    catalogue.items.map((item) => item.pilot === true),
    [true, false, false, false, false, false],
  );
});

test("pilot seats are shown as the server counts them, sold out included", () => {
  const offer = {
    label: "Founding pricing",
    note: null,
    seatsTotal: 10,
    seatsRemaining: 7,
    soldOut: false,
  };
  assert.equal(pilotSeatsLabel(offer), "7 of 10 pilot seats left");
  assert.equal(
    pilotSeatsLabel({ ...offer, seatsRemaining: 1 }),
    "1 of 10 pilot seat left",
  );
  assert.equal(
    pilotSeatsLabel({ ...offer, seatsRemaining: 0, soldOut: true }),
    "All 10 pilot seats are taken",
  );
});

test("a pilot bundle shows the price it discounts, and only a real discount", () => {
  const bundle = {
    sku: "Pilot Launch",
    credits: 1,
    amountMinor: 49900,
    currency: "USD",
    originalAmountMinor: 60000,
  };
  assert.deepEqual(bundleOriginalPrice(bundle), {
    amountMinor: 60000,
    currency: "USD",
  });
  assert.equal(
    bundleOriginalPrice({ ...bundle, originalAmountMinor: null }),
    null,
  );
  assert.equal(
    bundleOriginalPrice({ ...bundle, originalAmountMinor: 49900 }),
    null,
  );
});

test("the landing sets the pilot apart and lists every regular package after it", async () => {
  const catalogue = await billingMockAdapter.listPublicBundles("US");
  const { pilot, regular } = separatePilotPackages(
    catalogue.items,
    catalogue.pilotOffer,
  );

  // The pilot stands alone: no regular package is pulled up beside it.
  assert.ok(pilot.length > 0);
  assert.ok(pilot.every((item) => item.pilot === true));
  // The regular one-market price stays with the other regular packages.
  assert.ok(regular.some((item) => item.credits === 1));
  assert.ok(regular.every((item) => item.pilot !== true));
  // Nothing dropped, nothing reordered.
  assert.deepEqual(
    regular.map((item) => item.sku),
    catalogue.items.filter((item) => item.pilot !== true).map((item) => item.sku),
  );
  assert.equal(pilot.length + regular.length, catalogue.items.length);
});

test("without a pilot offer, pilot packages are not shown at all", async () => {
  const catalogue = await billingMockAdapter.listPublicBundles("US");
  const { pilot, regular } = separatePilotPackages(catalogue.items, null);

  assert.deepEqual(pilot, []);
  assert.ok(regular.every((item) => item.pilot !== true));
});

test("price group headings say price, keeping the server's name for the pilot", () => {
  assert.equal(priceGroupHeading("Founding pricing"), "Founding price");
  assert.equal(priceGroupHeading("Early access Pricing"), "Early access Price");
  // Only a closing "pricing" changes; anything else is the server's wording.
  assert.equal(priceGroupHeading("Pricing for founders"), "Pricing for founders");
  assert.equal(priceGroupHeading("Founding offer"), "Founding offer");
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

test("each pilot price sits beside the regular price for the same markets", async () => {
  const catalogue = await billingMockAdapter.listPublicBundles(
    LANDING_DEFAULT_COUNTRY,
  );
  const { comparisons, others } = splitPilotCatalogue(catalogue.items);

  assert.deepEqual(
    comparisons.map(({ pilot, regular }) => [pilot.sku, regular?.sku]),
    [["Pilot Launch", "Launch"]],
  );
  assert.deepEqual(
    others.map((item) => item.sku),
    ["2 Markets", "3 Markets", "4 Markets", "5 Markets"],
  );
  // Every server item is shown exactly once.
  assert.equal(comparisons.length * 2 + others.length, catalogue.items.length);
});

test("without a pilot, every package is a regular one", () => {
  const items = [
    { sku: "Launch", credits: 1, amountMinor: 60000, currency: "USD" },
  ];
  assert.deepEqual(splitPilotCatalogue(items), {
    comparisons: [],
    others: items,
  });
});

test("formats each currency with the digit grouping its buyers expect", () => {
  assert.equal(formatMinorAmount({ amountMinor: 1_080_000_00, currency: "INR" }), "₹10,80,000.00");
  assert.equal(formatMinorAmount({ amountMinor: 1_080_000_00, currency: "USD" }), "$1,080,000.00");
  assert.equal(formatMinorAmount({ amountMinor: 150_000, currency: "GBP" }), "£1,500.00");
});
