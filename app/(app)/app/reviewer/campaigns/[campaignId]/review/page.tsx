'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useCampaignRunWorkspace } from '@/hooks/useCampaignRunWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ReviewerCampaignReviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();
  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';
  const runWorkspace = useCampaignRunWorkspace(campaignId, isOpsRole);

  useEffect(() => {
    if (isLoading || !isOpsRole || runWorkspace.isLoading) {
      return;
    }

    if (user?.role === 'ADMIN') {
      if (runWorkspace.runId) {
        router.replace(`/app/admin/runs/${runWorkspace.runId}`);
        return;
      }

      router.replace(`/app/admin/campaigns/${campaignId}`);
      return;
    }

    const inboxQuery = runWorkspace.runId
      ? `?pipelineRunId=${encodeURIComponent(runWorkspace.runId)}`
      : '';

    router.replace(`/app/reviewer/strategy-reviews${inboxQuery}`);
  }, [campaignId, isLoading, isOpsRole, router, runWorkspace.isLoading, runWorkspace.runId, user?.role]);

  if (isLoading || runWorkspace.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Resolving review workspace...</div>;
  }

  if (!isOpsRole) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Only reviewer and admin users can access review workspaces.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (runWorkspace.error) {
    return (
      <div className="space-y-4 p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 text-sm text-destructive">
            {runWorkspace.error instanceof Error
              ? runWorkspace.error.message
              : 'Failed to resolve a run workspace for this campaign.'}
          </CardContent>
        </Card>
        <Link href="/app/reviewer/strategy-reviews">
          <Button variant="outline">Back to Reviewer Inbox</Button>
        </Link>
      </div>
    );
  }

  return <div className="p-6 text-sm text-muted-foreground">Redirecting to the current review flow...</div>;
}
