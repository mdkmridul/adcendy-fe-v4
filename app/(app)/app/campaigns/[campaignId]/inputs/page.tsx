'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignLifecycle } from '@/hooks/useCampaignLifecycle';
import { wizardRepository } from '@/shared/api/repositories';
import { canAccessCampaignFiles } from '@/shared/components/campaigns/campaign-ui';
import { SubmittedInputsSummary } from '@/shared/components/campaigns/SubmittedInputsSummary';

export default function CampaignInputsPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { campaign, stage, isLoading } = useCampaignLifecycle(campaignId);

  const { data: preview, isLoading: isPreviewLoading } = useQuery({
    queryKey: ['campaign-inputs-preview', campaignId],
    queryFn: async () => {
      try {
        return await wizardRepository.getPreview(campaignId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(campaignId) && stage === 'waiting',
  });

  if (isLoading || isPreviewLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-40 animate-pulse rounded-lg bg-card" />
        <div className="h-56 animate-pulse rounded-lg bg-card" />
      </div>
    );
  }

  if (!campaign || stage !== 'waiting') {
    return (
      <Card className="mx-auto max-w-3xl border-border bg-card">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">Submitted inputs are only shown while this campaign is in review.</p>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href={`/app/campaigns/${campaignId}/overview`}>Back to Overview</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filesAvailable = canAccessCampaignFiles(campaign);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-space-grotesk text-lg">Submitted Inputs</CardTitle>
            <CardDescription>
              Full submitted context for this campaign while the strategy is still in review.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button asChild variant="outline">
              <Link href={`/app/campaigns/${campaignId}/overview`}>
                Back to Overview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {filesAvailable ? (
              <Button asChild variant="ghost">
                <Link href={`/app/campaigns/${campaignId}/files`}>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Open Files
                  </span>
                </Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <SubmittedInputsSummary campaign={campaign} preview={preview} mode="full" />
        </CardContent>
      </Card>
    </div>
  );
}
