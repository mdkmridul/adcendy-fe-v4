'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignDocumentsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  CampaignDocumentUploadInput,
  CampaignDocumentUploadOptions,
} from '@/shared/types/campaignDocument';

export function useCampaignDocuments(campaignId: string | null) {
  return useQuery({
    queryKey: campaignId
      ? queryKeys.documents.list(campaignId)
      : queryKeys.documents.all,
    queryFn: async () => {
      if (!campaignId) {
        throw new Error('Campaign id is required to load documents.');
      }
      return campaignDocumentsRepository.listDocuments(campaignId);
    },
    enabled: Boolean(campaignId),
  });
}

export function useCampaignArtifacts(campaignId: string | null) {
  return useQuery({
    queryKey: campaignId
      ? queryKeys.artifacts.list(campaignId)
      : queryKeys.artifacts.all,
    queryFn: async () => {
      if (!campaignId) {
        throw new Error('Campaign id is required to load artifacts.');
      }
      return campaignDocumentsRepository.listArtifacts(campaignId);
    },
    enabled: Boolean(campaignId),
  });
}

export function useCampaignDocumentUpload(campaignId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      options,
    }: {
      input: CampaignDocumentUploadInput;
      options?: CampaignDocumentUploadOptions;
    }) => {
      if (!campaignId) {
        throw new Error('Campaign id is required to upload documents.');
      }
      return campaignDocumentsRepository.uploadDocument(
        campaignId,
        input,
        options,
      );
    },
    onSuccess: async () => {
      if (campaignId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.documents.list(campaignId),
        });
      }
    },
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

export function useCampaignArtifactDownload(campaignId: string | null) {
  return useMutation({
    mutationFn: async (artifactId: string) => {
      if (!campaignId) {
        throw new Error('Campaign id is required to download artifacts.');
      }
      return campaignDocumentsRepository.getArtifactDownload(
        campaignId,
        artifactId,
      );
    },
  });
}

export function useRequestCampaignPdfArtifact(campaignId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (runId?: string) => {
      if (!campaignId) {
        throw new Error('Campaign id is required to generate a PDF artifact.');
      }
      return campaignDocumentsRepository.requestPdfArtifact(campaignId, runId);
    },
    onSuccess: async () => {
      if (campaignId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.artifacts.list(campaignId),
        });
      }
    },
  });
}
