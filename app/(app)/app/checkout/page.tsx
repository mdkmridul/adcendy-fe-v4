"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { billingRepository, legalRepository } from "@/shared/api/repositories";
import { queryKeys } from "@/shared/api/queryKeys";
import { resolveLegalErrorMessage } from "@/shared/legal/legal-error";
import {
  areAllRequiredDocumentsAccepted,
  buildCheckoutAcceptPayload,
  buildLegalChecklistItems,
  getCheckoutRequiredDocumentIds,
} from "@/shared/legal/legal-flow-utils";
import { CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES } from "@/shared/types/legal";
import type { BillingOrder } from "@/shared/types/billing";
import {
  formatMinorAmount,
  loadRazorpayCheckout,
  type RazorpayCheckoutResponse,
} from "@/shared/payments/razorpay";
import {
  isPilotCatalogue,
  marketCountDescription,
  marketCountLabel,
} from "@/shared/payments/market-catalogue";
import { useAuth } from "@/features/auth/useAuth";
import ENV from "@/lib/env";
import {
  INDIAN_PAYMENT_REFUND_MESSAGE,
  isIndianPaymentRefund,
} from "@/shared/payments/pricingPreference";

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // SKUs are the server's to name, so nothing is preselected by name: until
  // the buyer picks, the first package the server listed is the choice.
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [acceptedDocumentIds, setAcceptedDocumentIds] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<BillingOrder | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const documentsQuery = useQuery({
    queryKey: queryKeys.legal.activeDocuments(),
    queryFn: () => legalRepository.getActiveDocuments(),
    refetchOnWindowFocus: false,
  });
  const orderQuery = useQuery({
    queryKey: queryKeys.billing.order(currentOrder?.orderId ?? "none"),
    queryFn: () => billingRepository.getOrder(currentOrder!.orderId),
    enabled: shouldPoll && Boolean(currentOrder),
    refetchInterval: (query) => {
      const order = query.state.data as BillingOrder | undefined;
      const status = order?.status;
      // A refund can take days to settle; the buyer is told at once, so
      // there is nothing more to wait for.
      if (isIndianPaymentRefund(order)) return false;
      return shouldPoll &&
        (!status || status === "CREATED" || status === "PENDING")
        ? 2000
        : false;
    },
    refetchOnWindowFocus: true,
  });

  const displayedOrder = orderQuery.data ?? currentOrder;
  // An India-priced order paid from abroad is refunded, and the buyer is
  // told why.
  const refundedForIndianPayment = isIndianPaymentRefund(displayedOrder);
  // Prices follow the visitor's location alone; there is no switch
  // (backend R-8).
  const bundlesQuery = useQuery({
    queryKey: queryKeys.billing.bundles(),
    queryFn: () => billingRepository.listBundles(),
    refetchOnWindowFocus: false,
  });

  const activeDocuments = useMemo(
    () => documentsQuery.data ?? [],
    [documentsQuery.data],
  );
  const bundles = useMemo(
    () => bundlesQuery.data?.items ?? [],
    [bundlesQuery.data],
  );
  const selectedBundle =
    bundles.find((bundle) => bundle.sku === selectedSku) ?? bundles[0];
  const isPilot = isPilotCatalogue(bundlesQuery.data);
  const checkoutChecklistItems = useMemo(
    () =>
      buildLegalChecklistItems(
        activeDocuments,
        CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES,
      ),
    [activeDocuments],
  );
  const requiredDocumentIds = useMemo(
    () => getCheckoutRequiredDocumentIds(activeDocuments),
    [activeDocuments],
  );
  const hasAcceptedAllRequiredDocuments = useMemo(
    () =>
      areAllRequiredDocumentsAccepted(requiredDocumentIds, acceptedDocumentIds),
    [acceptedDocumentIds, requiredDocumentIds],
  );

  useEffect(() => {
    if (displayedOrder?.status !== "PAID") return;

    let cancelled = false;
    const returnToDashboard = async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.profile.me(),
        });
      } finally {
        if (!cancelled) router.replace("/app");
      }
    };

    void returnToDashboard();
    return () => {
      cancelled = true;
    };
  }, [displayedOrder?.status, queryClient, router]);

  // "Your markets will appear" would contradict the refund message beside it.
  const statusSuccess = refundedForIndianPayment
    ? null
    : displayedOrder?.status === "PAID"
      ? `Payment captured. ${marketCountLabel(displayedOrder.credits)} added to your account.`
      : submitSuccess;
  const statusError = refundedForIndianPayment
    ? INDIAN_PAYMENT_REFUND_MESSAGE
    : displayedOrder?.status === "FAILED" ||
        displayedOrder?.status === "CANCELLED"
      ? "The payment was not completed. No markets were added; you can try again."
      : displayedOrder?.status === "REFUNDED"
        ? "This payment was refunded. Its markets are no longer available."
        : submitError;

  const completeCheckout = async (
    order: BillingOrder,
    response: RazorpayCheckoutResponse,
  ) => {
    setIsCheckoutOpen(false);
    setSubmitError(null);
    setSubmitSuccess(
      "Payment received. Verifying and waiting for capture confirmation…",
    );
    try {
      const result = await billingRepository.verifyPayment(order.orderId, {
        providerOrderId: response.razorpay_order_id,
        providerPaymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      });
      setCurrentOrder(result.order);
      if (result.order.status === "PAID") {
        setSubmitSuccess(
          `Payment captured. ${marketCountLabel(result.order.credits)} added to your account.`,
        );
      } else {
        setSubmitSuccess(
          "Payment verified. Your markets will appear as soon as Razorpay confirms capture.",
        );
        setShouldPoll(true);
      }
    } catch (error) {
      setSubmitSuccess(null);
      setSubmitError(
        errorMessage(
          error,
          "Payment verification failed. Please contact support before retrying.",
        ),
      );
    }
  };

  const startPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBundle) throw new Error("Select how many markets.");
      if (
        requiredDocumentIds.length !==
        CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES.length
      ) {
        throw new Error(
          "Required checkout policies are unavailable. Please refresh.",
        );
      }
      if (!hasAcceptedAllRequiredDocuments)
        throw new Error("CHECKOUT_POLICIES_NOT_ACCEPTED_V2");
      const razorpayKeyId = ENV.public.razorpayKeyId;
      if (!ENV.API.isMock && !razorpayKeyId) {
        throw new Error(
          "Payments are temporarily unavailable because Razorpay is not configured.",
        );
      }

      const Razorpay = ENV.API.isMock ? null : await loadRazorpayCheckout();
      const order = await billingRepository.createOrder(
        selectedBundle.sku,
        crypto.randomUUID(),
      );
      if (!order.providerOrderId)
        throw new Error("Razorpay did not return an order ID.");
      setCurrentOrder(order);

      const payload = buildCheckoutAcceptPayload(
        requiredDocumentIds,
        order.orderId,
      );
      await legalRepository.acceptDocuments({
        ...payload,
        metadata: { flow: "checkout" },
      });

      if (ENV.API.isMock) {
        await completeCheckout(order, {
          razorpay_order_id: order.providerOrderId,
          razorpay_payment_id: `pay_${crypto.randomUUID().replaceAll("-", "")}`,
          razorpay_signature: "0".repeat(64),
        });
        return;
      }

      if (!Razorpay || !razorpayKeyId) {
        throw new Error("Razorpay Checkout is not available.");
      }

      const checkout = new Razorpay({
        key: razorpayKeyId,
        amount: order.amountMinor,
        currency: order.currency,
        name: "AdCendy",
        description: `${marketCountLabel(order.credits)} — ${marketCountDescription(order.credits)}`,
        image: `${window.location.origin}/Adcendy-logo-tight.svg`,
        order_id: order.providerOrderId,
        prefill: { email: user?.email },
        theme: { color: "#D4A853" },
        retry: { enabled: true },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setIsCheckoutOpen(false);
            setSubmitSuccess(null);
            setSubmitError(
              "Payment window closed. You have not been charged for an incomplete payment.",
            );
          },
        },
        handler: (response) => void completeCheckout(order, response),
      });
      checkout.on("payment.failed", (response) => {
        setSubmitSuccess(null);
        setSubmitError(
          response.error?.description ??
            "Payment failed. Please retry or use another method.",
        );
      });
      setIsCheckoutOpen(true);
      checkout.open();
    },
    onMutate: () => {
      setSubmitError(null);
      setSubmitSuccess(null);
      setShouldPoll(false);
      setCurrentOrder(null);
    },
    onError: (error: unknown) => {
      setIsCheckoutOpen(false);
      setSubmitSuccess(null);
      setSubmitError(
        resolveLegalErrorMessage(
          error,
          errorMessage(error, "Could not start payment. Please retry."),
        ),
      );
    },
  });

  const toggleAcceptedDocument = (documentId: string, checked: boolean) => {
    setSubmitError(null);
    setAcceptedDocumentIds((previous) =>
      checked
        ? previous.includes(documentId)
          ? previous
          : [...previous, documentId]
        : previous.filter((id) => id !== documentId),
    );
  };

  const isBusy = startPaymentMutation.isPending || isCheckoutOpen;
  const policiesReady =
    requiredDocumentIds.length ===
    CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES.length;

  return (
    <div className="space-y-5 p-6">
      <div className="space-y-1">
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Billing &amp; markets
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirm your market, accept the required policies, and pay securely
          with Razorpay.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Choose your markets</CardTitle>
              <CardDescription>
                One market is one country, covered end to end. Prices are
                loaded from AdCendy’s billing server.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {isPilot ? (
                <p className="text-sm font-medium text-primary sm:col-span-3">
                  Pilot pricing — these prices hold only while the pilot runs.
                </p>
              ) : null}
              {bundlesQuery.data?.fallbackApplied ? (
                <Alert className="sm:col-span-3">
                  <AlertDescription>
                    Local pricing is not configured for this country yet. The
                    US price in USD applies.
                  </AlertDescription>
                </Alert>
              ) : null}
              {bundles.map((bundle) => {
                const selected = selectedBundle?.sku === bundle.sku;
                return (
                  <button
                    key={bundle.sku}
                    type="button"
                    onClick={() => setSelectedSku(bundle.sku)}
                    className={`rounded-lg border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                  >
                    <div className="text-2xl font-semibold">
                      {marketCountLabel(bundle.credits)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {marketCountDescription(bundle.credits)}
                    </div>
                    <div className="mt-3 font-medium">
                      {formatMinorAmount(bundle)}
                    </div>
                  </button>
                );
              })}
              {bundlesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading prices…
                </p>
              ) : null}
              {bundlesQuery.isError ? (
                <Alert variant="destructive" className="sm:col-span-3">
                  <AlertDescription>Could not load pricing.</AlertDescription>
                </Alert>
              ) : null}
              <p className="text-sm text-muted-foreground sm:col-span-3">
                Need a set of countries these don’t cover?{" "}
                <Link className="text-primary hover:underline" href="/contact">
                  Ask us for a multi-market quote
                </Link>{" "}
                — we run the same campaign across each country you name and
                price the package with you.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Review and accept</CardTitle>
              <CardDescription>
                These acceptances are linked to this payment order before
                Checkout opens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentsQuery.isLoading ? (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  Loading checkout policies…
                </div>
              ) : null}
              {documentsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load checkout policies.
                  </AlertDescription>
                </Alert>
              ) : null}
              {checkoutChecklistItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border border-border px-3 py-3"
                >
                  <Checkbox
                    checked={acceptedDocumentIds.includes(item.id)}
                    onCheckedChange={(checked) =>
                      toggleAcceptedDocument(item.id, checked === true)
                    }
                    className="mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">
                    I accept the{" "}
                    {item.href ? (
                      <a
                        className="text-primary hover:underline"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      item.label
                    )}
                  </span>
                </label>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void documentsQuery.refetch()}
                disabled={isBusy}
              >
                Refresh policies
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              Razorpay securely handles card, UPI, wallet, and netbanking
              details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedBundle ? (
              <div className="flex items-end justify-between border-b border-border pb-4">
                <div>
                  <div className="font-medium">
                    {marketCountLabel(selectedBundle.credits)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    One-time purchase
                  </div>
                </div>
                <div className="text-xl font-semibold">
                  {formatMinorAmount(selectedBundle)}
                </div>
              </div>
            ) : null}

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Server-verified
                payment signature
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Markets added
                only after capture
              </div>
            </div>

            {statusError ? (
              <Alert variant="destructive">
                <AlertDescription>{statusError}</AlertDescription>
              </Alert>
            ) : null}
            {statusSuccess ? (
              <Alert>
                <AlertDescription>{statusSuccess}</AlertDescription>
              </Alert>
            ) : null}
            {displayedOrder ? (
              <p className="text-xs text-muted-foreground">
                Order {displayedOrder.orderId} · {displayedOrder.status}
              </p>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              onClick={() => startPaymentMutation.mutate()}
              disabled={
                isBusy ||
                documentsQuery.isLoading ||
                bundlesQuery.isLoading ||
                !selectedBundle ||
                !policiesReady ||
                !hasAcceptedAllRequiredDocuments
              }
            >
              {startPaymentMutation.isPending
                ? "Preparing secure checkout…"
                : isCheckoutOpen
                  ? "Checkout open…"
                  : selectedBundle
                    ? `Pay ${formatMinorAmount(selectedBundle)}`
                    : "Select a market"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              AdCendy never receives or stores your card, UPI PIN, or banking
              credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
