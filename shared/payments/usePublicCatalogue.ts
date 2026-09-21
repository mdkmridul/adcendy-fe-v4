"use client";

import { useQuery } from "@tanstack/react-query";
import { billingRepository } from "@/shared/api/repositories/billing.repo";
import { queryKeys } from "@/shared/api/queryKeys";
import { isPilotCatalogue } from "./market-catalogue";

/**
 * The public catalogue, shared by every landing section that depends on it —
 * the same query key, so pricing, the FAQ and the manifesto make one request
 * between them. Prices follow the visitor's location alone (backend R-8).
 */
export function usePublicCatalogue() {
  const query = useQuery({
    queryKey: queryKeys.billing.publicBundles(),
    queryFn: () => billingRepository.listPublicBundles(),
    staleTime: 60_000,
  });
  return { ...query, isPilot: isPilotCatalogue(query.data) };
}
