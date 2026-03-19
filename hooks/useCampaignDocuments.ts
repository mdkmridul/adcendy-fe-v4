'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { campaignDocumentsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';

export function useCampaignDocuments(campaignId: string | null) {
  return useQuery({
    queryKey: campaignId ? queryKeys.documents.list(campaignId) : queryKeys.documents.all,
    queryFn: async () => {
      if (!campaignId) {
        throw new Error('Campaign id is required to load documents.');
      }

      return campaignDocumentsRepository.listDocuments(campaignId);
    },
    enabled: !!campaignId,
  });
}

export function useCampaignDocumentDownload(campaignId: string | null) {
  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!campaignId) {
        throw new Error('Campaign id is required to download documents.');
      }

      return campaignDocumentsRepository.getDownload(campaignId, documentId);
    },
  });
}
