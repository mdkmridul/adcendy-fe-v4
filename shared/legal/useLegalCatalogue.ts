'use client';

import { useQuery } from '@tanstack/react-query';
import { legalRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';

const LEGAL_CATALOGUE_STALE_MS = 5 * 60_000;

/** The published policies, readable without a session (footer, sign-up). */
export function usePublicLegalDocuments() {
  return useQuery({
    queryKey: queryKeys.legal.publicDocuments(),
    queryFn: () => legalRepository.getActivePublicDocuments(),
    staleTime: LEGAL_CATALOGUE_STALE_MS,
    refetchOnWindowFocus: false,
  });
}

/** Which consents exist and where each is required, as the Backend states it. */
export function useConsentCatalogue() {
  return useQuery({
    queryKey: queryKeys.legal.consentCatalogue(),
    queryFn: () => legalRepository.getConsentCatalogue(),
    staleTime: LEGAL_CATALOGUE_STALE_MS,
    refetchOnWindowFocus: false,
  });
}
