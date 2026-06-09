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
import { buildConsentLabel, buildConsentToggleState, type ConsentToggleState } from '@/shared/legal/legal-flow-utils';
import {
  ACCOUNT_OPTIONAL_CONSENT_TYPES,
  LEGAL_CONSENT_TYPE_VALUES,
  WIZARD_REQUIRED_CONSENT_TYPES,
  type LegalConsentType,
} from '@/shared/types/legal';

const DEFAULT_CONSENT_STATE: ConsentToggleState = {
  PRIVACY_PROCESSING: false,
  AI_PROCESSING: false,
  BENCHMARK_DATA: false,
  MARKETING_EMAILS: false,
  ADS_INTEGRATION: false,
};

export default function PrivacyConsentsPage() {
  const queryClient = useQueryClient();
  const [consentState, setConsentState] = useState<ConsentToggleState>(DEFAULT_CONSENT_STATE);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: consentRecords = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.legal.consentsMe(),
    queryFn: () => legalRepository.getMyConsents(),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setConsentState({
      ...DEFAULT_CONSENT_STATE,
      ...buildConsentToggleState(consentRecords),
    });
  }, [consentRecords]);

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
              {LEGAL_CONSENT_TYPE_VALUES.map((consentType) => {
                const checked = consentState[consentType];
                const record = consentRecordByType[consentType];
                const isOptional = ACCOUNT_OPTIONAL_CONSENT_TYPES.includes(consentType);
                const isRequired = WIZARD_REQUIRED_CONSENT_TYPES.includes(consentType);

                return (
                  <div
                    key={consentType}
                    className="flex items-start justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground/90">{buildConsentLabel(consentType)}</p>
                        <Badge variant={checked ? 'default' : 'outline'}>
                          {checked ? 'GIVEN' : 'WITHDRAWN'}
                        </Badge>
                        {isRequired ? <Badge variant="secondary">Required</Badge> : null}
                      </div>
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
