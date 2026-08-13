import type {
  BillingBundle,
  BillingCatalogue,
  BillingOrder,
  VerifyPaymentPayload,
  VerifyPaymentResult,
} from "@/shared/types/billing";

const indiaBundles: BillingBundle[] = [
  { sku: "GEN_1", credits: 1, amountMinor: 19900, currency: "INR" },
  { sku: "GEN_5", credits: 5, amountMinor: 79900, currency: "INR" },
  { sku: "GEN_11", credits: 11, amountMinor: 149900, currency: "INR" },
];
const usBundles: BillingBundle[] = [
  { sku: "GEN_1", credits: 1, amountMinor: 299, currency: "USD" },
  { sku: "GEN_5", credits: 5, amountMinor: 999, currency: "USD" },
  { sku: "GEN_11", credits: 11, amountMinor: 1799, currency: "USD" },
];
const orders = new Map<string, BillingOrder>();

export const billingMockAdapter = {
  async listPublicBundles(countryCode: string): Promise<BillingCatalogue> {
    return this.listBundles(countryCode);
  },

  async listBundles(countryCode: string): Promise<BillingCatalogue> {
    const requestedCountryCode = countryCode.toUpperCase();
    const isIndia = requestedCountryCode === "IN";
    return {
      catalogueVersion: "2026-08-01",
      effectiveFrom: "2026-08-01T00:00:00.000Z",
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
    countryCode: string,
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
