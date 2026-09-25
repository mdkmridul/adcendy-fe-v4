import { http } from "../index";
import type { ApiResponse } from "../types";
import type {
  BillingCatalogue,
  BillingOrder,
  VerifyPaymentPayload,
  VerifyPaymentResult,
} from "@/shared/types/billing";

function unwrapData<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

export const billingRealAdapter = {
  // No country is sent: the server prices by the visitor's location alone.
  async listPublicBundles(): Promise<BillingCatalogue> {
    const response = await http<
      ApiResponse<BillingCatalogue> | BillingCatalogue
    >("/v1/billing/public/bundles");
    return unwrapData(response);
  },

  async listBundles(): Promise<BillingCatalogue> {
    const response = await http<
      ApiResponse<BillingCatalogue> | BillingCatalogue
    >("/v1/billing/bundles");
    return unwrapData(response);
  },

  async createOrder(
    sku: string,
    idempotencyKey: string,
    acceptedLegalDocumentVersionIdsV2: string[],
  ): Promise<BillingOrder> {
    const response = await http<ApiResponse<BillingOrder> | BillingOrder>(
      "/v1/billing/orders",
      {
        method: "POST",
        // The buyer's tick travels with the order, so the acceptance is
        // recorded before any payment is started.
        body: { sku, acceptedLegalDocumentVersionIdsV2 },
        headers: { "Idempotency-Key": idempotencyKey },
      },
    );
    return unwrapData(response);
  },

  async getOrder(orderId: string): Promise<BillingOrder> {
    const response = await http<ApiResponse<BillingOrder> | BillingOrder>(
      `/v1/billing/orders/${encodeURIComponent(orderId)}`,
    );
    return unwrapData(response);
  },

  async verifyPayment(
    orderId: string,
    payload: VerifyPaymentPayload,
  ): Promise<VerifyPaymentResult> {
    const response = await http<
      ApiResponse<VerifyPaymentResult> | VerifyPaymentResult
    >(`/v1/billing/orders/${encodeURIComponent(orderId)}/verify`, {
      method: "POST",
      body: payload,
    });
    return unwrapData(response);
  },
};
