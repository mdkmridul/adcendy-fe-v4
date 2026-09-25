import type {
  BillingBundle,
  BillingCatalogue,
  BillingOrder,
  VerifyPaymentPayload,
  VerifyPaymentResult,
} from "@/shared/types/billing";

// A SKU's credits are markets: one credit buys one country, covered end to
// end. The server owns these prices and how many packages a country gets;
// this mirrors its shape for mock mode — India lists one package, other
// countries several — so both layouts get exercised without a backend.
// Mirrors the live catalogue 2026-09-21: pilot bundles first, while seats
// remain, then the regular list.
const indiaBundles: BillingBundle[] = [
  {
    sku: "Pilot Launch",
    credits: 1,
    amountMinor: 1490000,
    currency: "INR",
    pilot: true,
    originalAmountMinor: 1990000,
    discountPercent: 25,
  },
  { sku: "Launch", credits: 1, amountMinor: 1990000, currency: "INR" },
];
const usBundles: BillingBundle[] = [
  {
    sku: "Pilot Launch",
    credits: 1,
    amountMinor: 49900,
    currency: "USD",
    pilot: true,
    originalAmountMinor: 60000,
    discountPercent: 17,
  },
  { sku: "Launch", credits: 1, amountMinor: 60000, currency: "USD" },
  { sku: "2 Markets", credits: 2, amountMinor: 108000, currency: "USD" },
  { sku: "3 Markets", credits: 3, amountMinor: 153000, currency: "USD" },
  { sku: "4 Markets", credits: 4, amountMinor: 192000, currency: "USD" },
  { sku: "5 Markets", credits: 5, amountMinor: 225000, currency: "USD" },
];
const orders = new Map<string, BillingOrder>();

export const billingMockAdapter = {
  async listPublicBundles(countryCode?: string): Promise<BillingCatalogue> {
    return this.listBundles(countryCode);
  },

  // The country stands in for the visitor's location, which the server reads
  // from Cloudflare; with none, it prices in USD, as the server does.
  async listBundles(countryCode?: string): Promise<BillingCatalogue> {
    const requestedCountryCode = (countryCode ?? "US").toUpperCase();
    const isIndia = requestedCountryCode === "IN";
    return {
      catalogueVersion: "2026-09-21",
      effectiveFrom: "2026-09-22T00:00:00.000Z",
      requestedCountryCode,
      pricingCountryCode: isIndia ? "IN" : "US",
      currency: isIndia ? "INR" : "USD",
      fallbackApplied: !isIndia && requestedCountryCode !== "US",
      items: isIndia ? indiaBundles : usBundles,
      pilot: true,
      pilotOffer: {
        label: "Founding pricing",
        note: "Introductory pricing for our founding clients",
        seatsTotal: 10,
        seatsRemaining: 7,
        soldOut: false,
      },
    };
  },

  async createOrder(
    sku: string,
    _idempotencyKey: string,
    _acceptedLegalDocumentVersionIdsV2?: string[],
    countryCode?: string,
  ): Promise<BillingOrder> {
    const catalogue = await this.listBundles(countryCode);
    const bundle = catalogue.items.find((item) => item.sku === sku);
    if (!bundle) throw new Error("Invalid bundle SKU");
    const orderId = `mock-${crypto.randomUUID()}`;
    const order: BillingOrder = {
      orderId,
      provider: "RAZORPAY",
      providerOrderId: `order_${crypto.randomUUID().replaceAll("-", "")}`,
      providerPaymentId: null,
      amountMinor: bundle.amountMinor,
      currency: bundle.currency,
      credits: bundle.credits,
      status: "CREATED",
      bundleSku: bundle.sku,
      pilot: bundle.pilot ?? false,
      createdAt: new Date().toISOString(),
      paidAt: null,
      refundReason: null,
    };
    orders.set(orderId, order);
    return order;
  },

  async getOrder(orderId: string): Promise<BillingOrder> {
    const order = orders.get(orderId);
    if (!order) throw new Error("Order not found");
    return order;
  },

  async verifyPayment(
    orderId: string,
    payload: VerifyPaymentPayload,
  ): Promise<VerifyPaymentResult> {
    const order = orders.get(orderId);
    if (!order || order.providerOrderId !== payload.providerOrderId) {
      throw new Error("Payment order does not match");
    }
    const paid: BillingOrder = {
      ...order,
      providerPaymentId: payload.providerPaymentId,
      status: "PAID",
      paidAt: new Date().toISOString(),
    };
    orders.set(orderId, paid);
    return { verified: true, order: paid };
  },
};
