export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface BillingBundle {
  sku: string;
  credits: number;
  amountMinor: number;
  currency: string;
}

export interface BillingCatalogue {
  catalogueVersion: string;
  effectiveFrom: string;
  requestedCountryCode: string;
  pricingCountryCode: string;
  currency: string;
  fallbackApplied: boolean;
  items: BillingBundle[];
}

export interface BillingOrder {
  orderId: string;
  provider: "RAZORPAY";
  providerOrderId: string | null;
  providerPaymentId: string | null;
  amountMinor: number;
  currency: string;
  credits: number;
  status: PaymentStatus;
  bundleSku: string;
  createdAt: string;
  paidAt: string | null;
}

export interface VerifyPaymentPayload {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  order: BillingOrder;
}
