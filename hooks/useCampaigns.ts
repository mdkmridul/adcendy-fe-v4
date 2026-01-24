'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { campaignsRepository } from '@/shared/api/repositories';
import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from '@/shared/types/campaign';
import type { ID } from '@/shared/types/common';

/**
 * Hook to fetch all campaigns
 * Uses SWR with automatic error handling and caching
 */
export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR(
    'campaigns',
    () => campaignsRepository.listCampaigns(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    campaigns: data || [],
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

/**
 * Hook to fetch a single campaign by ID
 */
export function useCampaign(campaignId: ID | null) {
  const { data, error, isLoading, mutate } = useSWR(
    campaignId ? `campaign-${campaignId}` : null,
    () => campaignId ? campaignsRepository.getCampaign(campaignId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    campaign: data || null,
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

/**
 * Hook to create a campaign with optimistic updates
 */
export function useCreateCampaign() {
  const { mutate } = useSWR('campaigns', () => campaignsRepository.listCampaigns());

  const create = useMemo(
    () => async (payload: CreateCampaignPayload) => {
      try {
        const newCampaign = await campaignsRepository.createCampaign(payload);
        // Trigger a revalidation of the campaigns list
        await mutate();
        return newCampaign;
      } catch (error) {
        throw error;
      }
    },
    [mutate]
  );

  return { create };
}

/**
 * Hook to update a campaign
 */
export function useUpdateCampaign(campaignId: ID) {
  const { mutate: mutateList } = useSWR('campaigns', () => campaignsRepository.listCampaigns());
  const { mutate: mutateSingle } = useSWR(`campaign-${campaignId}`, () =>
    campaignsRepository.getCampaign(campaignId)
  );

  const update = useMemo(
    () => async (payload: UpdateCampaignPayload) => {
      try {
        const updated = await campaignsRepository.updateCampaign(campaignId, payload);
        // Revalidate both list and single campaign
        await Promise.all([mutateList(), mutateSingle()]);
        return updated;
      } catch (error) {
        throw error;
      }
    },
    [campaignId, mutateList, mutateSingle]
  );

  return { update };
}

/**
 * Hook to delete a campaign
 */
export function useDeleteCampaign() {
  const { mutate } = useSWR('campaigns', () => campaignsRepository.listCampaigns());

  const remove = useMemo(
    () => async (campaignId: ID) => {
      try {
        await campaignsRepository.deleteCampaign(campaignId);
        await mutate();
      } catch (error) {
        throw error;
      }
    },
    [mutate]
  );

  return { remove };
}
