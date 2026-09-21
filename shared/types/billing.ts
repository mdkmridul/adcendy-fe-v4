import type { BillingRefundReason } from "@/shared/payments/pricingPreference";

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
  /** A pilot bundle, sold only while pilot seats remain. */
  pilot?: boolean;
  /** The price before the discount, when the server states one. */
  originalAmountMinor?: number | null;
  discountPercent?: number | null;
}

/** The pilot as the server reports it; seats are counted from orders. */
export interface BillingPilotOffer {
  label: string;
  note: string | null;
  seatsTotal: number;
  seatsRemaining: number;
  soldOut: boolean;
}

export interface BillingCatalogue {
  catalogueVersion: string;
  effectiveFrom: string;
  requestedCountryCode: string;
  pricingCountryCode: string;
  currency: string;
  fallbackApplied: boolean;
  items: BillingBundle[];
  /**
   * Whether pilot bundles are on sale. Only an explicit `true` puts pilot
   * pricing and the pilot guarantee on the page; absent or false removes
   * both. Regular bundles are listed either way.
   */
  pilot?: boolean;
  /**
   * Present while the pilot runs in this market, sold out or not, so the
   * page can show how many seats are left.
   */
  pilotOffer?: BillingPilotOffer | null;
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
  /** Bought at the pilot price. */
  pilot?: boolean;
  createdAt: string;
  paidAt: string | null;
  /**
   * Why the order is being refunded instead of credited (backend R-8);
   * null for every other order.
   */
  refundReason?: BillingRefundReason | null;
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
