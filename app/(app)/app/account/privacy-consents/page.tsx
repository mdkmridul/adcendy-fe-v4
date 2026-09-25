'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { legalRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { resolveLegalErrorMessage } from '@/shared/legal/legal-error';
import {
  buildConsentToggleState,
  isConsentRequiredAt,
  type ConsentToggleState,
} from '@/shared/legal/legal-flow-utils';
import { useConsentCatalogue } from '@/shared/legal/useLegalCatalogue';
import type { LegalConsentType } from '@/shared/types/legal';

export default function PrivacyConsentsPage() {
  const queryClient = useQueryClient();
  const [consentState, setConsentState] = useState<ConsentToggleState>({});
  const catalogueQuery = useConsentCatalogue();
  const catalogue = useMemo(() => catalogueQuery.data ?? [], [catalogueQuery.data]);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: consentRecords = [], isLoading: isLoadingRecords, isError: isRecordsError } = useQuery({
    queryKey: queryKeys.legal.consentsMe(),
    queryFn: () => legalRepository.getMyConsents(),
    refetchOnWindowFocus: false,
  });

  const isLoading = isLoadingRecords || catalogueQuery.isLoading;
  const isError = isRecordsError || catalogueQuery.isError;

  useEffect(() => {
    setConsentState(buildConsentToggleState(consentRecords, catalogue));
  }, [consentRecords, catalogue]);

  const consentRecordByType = useMemo(() => {
    return consentRecords.reduce<Record<string, (typeof consentRecords)[number]>>((acc, record) => {
      acc[record.consentType] = record;
      return acc;
    }, {});
  }, [consentRecords]);

  const toggleOptionalConsentMutation = useMutation({
    mutationFn: async ({
      consentType,
      nextChecked,
    }: {
      consentType: LegalConsentType;
      nextChecked: boolean;
    }) => {
      if (nextChecked) {
        return legalRepository.giveConsent({
          consentType,
          source: 'API',
        });
      }

      return legalRepository.withdrawConsent({
        consentType,
        source: 'API',
      });
    },
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.legal.consentsMe() });
    },
    onError: (error: unknown, variables) => {
      setConsentState((previousState) => ({
        ...previousState,
        [variables.consentType]: !variables.nextChecked,
      }));
      setActionError(resolveLegalErrorMessage(error, 'Failed to update consent state.'));
    },
  });

  const handleOptionalConsentToggle = (consentType: LegalConsentType, nextChecked: boolean) => {
    setActionError(null);
    setConsentState((previousState) => ({
      ...previousState,
      [consentType]: nextChecked,
    }));
    toggleOptionalConsentMutation.mutate({
      consentType,
      nextChecked,
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-space-grotesk text-2xl">Privacy &amp; Consents</CardTitle>
          <CardDescription>
            Review and manage your current legal consent state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError ? (
            <Alert variant="destructive">
              <AlertDescription>Could not load consent state.</AlertDescription>
            </Alert>
          ) : null}

          {actionError ? (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="rounded-md border border-border px-4 py-6 text-sm text-muted-foreground">
              Loading consent state...
            </div>
          ) : (
            <div className="space-y-3">
              {catalogue.map(({ consentType, label, description, optionalAt }) => {
                const checked = consentState[consentType] === true;
                const record = consentRecordByType[consentType];
                const isOptional = optionalAt.includes('ACCOUNT');
                const isRequired = isConsentRequiredAt(catalogue, consentType, 'WIZARD');

                return (
                  <div
                    key={consentType}
                    className="flex items-start justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground/90">{label}</p>
                        <Badge variant={checked ? 'default' : 'outline'}>
                          {checked ? 'GIVEN' : 'WITHDRAWN'}
                        </Badge>
                        {isRequired ? <Badge variant="secondary">Required</Badge> : null}
                      </div>
                      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                      <p className="text-xs text-muted-foreground">
                        {record?.updatedAt ? `Updated ${new Date(record.updatedAt).toLocaleString()}` : 'No update recorded yet'}
                      </p>
                    </div>

                    {isOptional ? (
                      <Switch
                        checked={checked}
                        onCheckedChange={(nextChecked) => handleOptionalConsentToggle(consentType, nextChecked)}
                        disabled={toggleOptionalConsentMutation.isPending}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Manage in wizard flow</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
