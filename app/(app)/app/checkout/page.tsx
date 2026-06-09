'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { legalRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { resolveLegalErrorMessage } from '@/shared/legal/legal-error';
import {
  areAllRequiredDocumentsAccepted,
  buildCheckoutAcceptPayload,
  buildLegalChecklistItems,
  getCheckoutRequiredDocumentIds,
} from '@/shared/legal/legal-flow-utils';
import { CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES } from '@/shared/types/legal';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') ?? '');
  const [acceptedDocumentIds, setAcceptedDocumentIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const { data: activeDocuments = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.legal.activeDocuments(),
    queryFn: () => legalRepository.getActiveDocuments(),
    refetchOnWindowFocus: false,
  });

  const checkoutChecklistItems = useMemo(
    () => buildLegalChecklistItems(activeDocuments, CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES),
    [activeDocuments],
  );
  const requiredDocumentIds = useMemo(
    () => getCheckoutRequiredDocumentIds(activeDocuments),
    [activeDocuments],
  );
  const hasAcceptedAllRequiredDocuments = useMemo(
    () => areAllRequiredDocumentsAccepted(requiredDocumentIds, acceptedDocumentIds),
    [acceptedDocumentIds, requiredDocumentIds],
  );

  const acceptCheckoutPoliciesMutation = useMutation({
    mutationFn: async () => {
      if (!orderId.trim()) {
        throw new Error('Order ID is required before payment can continue.');
      }

      if (requiredDocumentIds.length !== CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES.length) {
        throw new Error('Required checkout policies are unavailable. Please refresh.');
      }

      if (!hasAcceptedAllRequiredDocuments) {
        throw new Error('CHECKOUT_POLICIES_NOT_ACCEPTED_V2');
      }

      const payload = buildCheckoutAcceptPayload(requiredDocumentIds, orderId.trim());
      return legalRepository.acceptDocuments({
        ...payload,
        metadata: {
          flow: 'checkout',
        },
      });
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess('Policies accepted. You can continue payment processing.');
    },
    onError: (error: unknown) => {
      setSubmitSuccess(null);
      setSubmitError(
        resolveLegalErrorMessage(
          error,
          'Could not save checkout policy acceptance. Please retry.',
        ),
      );
    },
  });

  const toggleAcceptedDocument = (documentId: string, checked: boolean) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setAcceptedDocumentIds((previous) => {
      if (checked) {
        return previous.includes(documentId) ? previous : [...previous, documentId];
      }
      return previous.filter((id) => id !== documentId);
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-2xl">Checkout Policies</CardTitle>
          <CardDescription>
            Accept all required legal documents before payment is finalized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="checkout-order-id">Order ID</Label>
            <Input
              id="checkout-order-id"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Enter current order ID"
            />
          </div>

          {isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load checkout policies.
              </AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="rounded-md border border-border px-4 py-6 text-sm text-muted-foreground">
              Loading checkout policies...
            </div>
          ) : (
            <div className="space-y-3">
              {checkoutChecklistItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-3"
                >
                  <Checkbox
                    checked={acceptedDocumentIds.includes(item.id)}
                    onCheckedChange={(checked) => toggleAcceptedDocument(item.id, checked === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">
                    I accept the{' '}
                    {item.href ? (
                      <a className="text-primary hover:underline" href={item.href}>
                        {item.label}
                      </a>
                    ) : (
                      item.label
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}

          {submitError ? (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {submitSuccess ? (
            <Alert>
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => acceptCheckoutPoliciesMutation.mutate()}
              disabled={
                acceptCheckoutPoliciesMutation.isPending ||
                isLoading ||
                requiredDocumentIds.length !== CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES.length ||
                !hasAcceptedAllRequiredDocuments ||
                !orderId.trim()
              }
            >
              {acceptCheckoutPoliciesMutation.isPending ? 'Saving...' : 'Accept and Continue'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              disabled={acceptCheckoutPoliciesMutation.isPending}
            >
              Refresh Policies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
