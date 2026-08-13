import type { BillingBundle } from "@/shared/types/billing";

const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error?: {
    description?: string;
    reason?: string;
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: { email?: string; contact?: string };
  theme?: { color: string };
  retry?: { enabled: boolean };
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
  handler: (response: RazorpayCheckoutResponse) => void;
}

export interface RazorpayCheckoutInstance {
  open(): void;
  on(
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ): void;
}

type RazorpayConstructor = new (
  options: RazorpayCheckoutOptions,
) => RazorpayCheckoutInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let checkoutScriptPromise: Promise<RazorpayConstructor> | null = null;

export function loadRazorpayCheckout(): Promise<RazorpayConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout requires a browser."));
  }
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (checkoutScriptPromise) {
    return checkoutScriptPromise;
  }

  checkoutScriptPromise = new Promise<RazorpayConstructor>(
    (resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`,
      );
      const script = existing ?? document.createElement("script");

      const handleLoad = () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          checkoutScriptPromise = null;
          reject(new Error("Razorpay Checkout did not initialize."));
        }
      };
      const handleError = () => {
        checkoutScriptPromise = null;
        reject(new Error("Could not load Razorpay Checkout."));
      };

      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
      if (!existing) {
        script.src = RAZORPAY_CHECKOUT_SCRIPT;
        script.async = true;
        document.head.appendChild(script);
      }
    },
  );

  return checkoutScriptPromise;
}

export function formatMinorAmount(
  bundle: Pick<BillingBundle, "amountMinor" | "currency">,
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: bundle.currency,
    maximumFractionDigits: 2,
  }).format(bundle.amountMinor / 100);
}
