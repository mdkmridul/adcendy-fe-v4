import { createRuntimeRepositoryAdapter } from "@/lib/env";
import { billingMockAdapter } from "../mock/billing.mock";
import { billingRealAdapter } from "../real/billing.real";
import type { VerifyPaymentPayload } from "@/shared/types/billing";

const adapter = createRuntimeRepositoryAdapter(
  billingMockAdapter,
  billingRealAdapter,
);

export const billingRepository = {
  listPublicBundles: (countryCode: string) =>
    adapter.listPublicBundles(countryCode),
  listBundles: (countryCode: string) => adapter.listBundles(countryCode),
  createOrder: (sku: string, idempotencyKey: string, countryCode: string) =>
    adapter.createOrder(sku, idempotencyKey, countryCode),
  getOrder: (orderId: string) => adapter.getOrder(orderId),
  verifyPayment: (orderId: string, payload: VerifyPaymentPayload) =>
    adapter.verifyPayment(orderId, payload),
};
