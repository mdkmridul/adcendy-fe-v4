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
const indiaBundles: BillingBundle[] = [
  { sku: "GEN_1", credits: 1, amountMinor: 19900, currency: "INR" },
];
// Mirrors the live US catalogue 2026-09-21.
const usBundles: BillingBundle[] = [
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
    };
  },

  async createOrder(
    sku: string,
    _idempotencyKey: string,
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
