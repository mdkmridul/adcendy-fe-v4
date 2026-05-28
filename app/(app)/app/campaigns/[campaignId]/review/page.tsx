'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { useCampaignRunWorkspace } from '@/hooks/useCampaignRunWorkspace';

export default function CampaignReviewPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();
  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';
  const runWorkspace = useCampaignRunWorkspace(campaignId, isOpsRole);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user?.role === 'REVIEWER') {
      if (runWorkspace.isLoading) {
        return;
      }

      const inboxQuery = runWorkspace.runId
        ? `?pipelineRunId=${encodeURIComponent(runWorkspace.runId)}`
        : '';
      router.replace(`/app/reviewer/strategy-reviews${inboxQuery}`);
      return;
    }

    if (user?.role === 'ADMIN') {
      if (runWorkspace.isLoading) {
        return;
      }

      if (runWorkspace.runId) {
        router.replace(`/app/admin/runs/${runWorkspace.runId}`);
        return;
      }

      router.replace(`/app/admin/campaigns/${campaignId}`);
      return;
    }

    router.replace('/app/unauthorized');
  }, [campaignId, isLoading, router, runWorkspace.isLoading, runWorkspace.runId, user?.role]);

  return <div className="p-6 text-sm text-muted-foreground">Redirecting...</div>;
}
