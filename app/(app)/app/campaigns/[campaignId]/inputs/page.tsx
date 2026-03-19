'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignLifecycle } from '@/hooks/useCampaignLifecycle';
import { wizardRepository } from '@/shared/api/repositories';
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Submitted Inputs</CardTitle>
            <CardDescription>
              Full submitted context for this campaign while the strategy is still in review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmittedInputsSummary campaign={campaign} preview={preview} mode="full" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Available Actions</CardTitle>
            <CardDescription>Use the overview for status, or keep supporting files organized here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link href={`/app/campaigns/${campaignId}/overview`}>
                Back to Overview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={`/app/campaigns/${campaignId}/files`}>
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Open Files
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
