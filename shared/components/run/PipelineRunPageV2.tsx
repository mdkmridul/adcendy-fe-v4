'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePipelineRunV2, useRetryPipelineRunV2 } from '@/hooks/usePipelineRunV2';
import { SectionReviewRunWorkspace } from '@/shared/components/ops/SectionReviewRunWorkspace';
import { PipelineRunStatusCardV2 } from '@/shared/components/run/PipelineRunStatusCardV2';

interface PipelineRunPageV2Props {
  campaignId: string;
  runId: string;
}

export function PipelineRunPageV2({
  campaignId,
  runId,
}: PipelineRunPageV2Props) {
  const runQuery = usePipelineRunV2(runId);
  const retryMutation = useRetryPipelineRunV2(runId);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Strategy generation
        </h1>
        <p className="text-muted-foreground">
          This page keeps the canonical run ID, so it can recover status after
          refreshes, reconnects, or a new browser session.
        </p>
      </div>

      <PipelineRunStatusCardV2
        run={runQuery.run}
        isLoading={runQuery.isLoading}
        isFetching={runQuery.isFetching}
        isOnline={runQuery.isOnline}
        error={runQuery.error}
        isRetrying={retryMutation.isPending}
        onRetry={() => retryMutation.mutate()}
        onRefresh={() => void runQuery.refetch({ cancelRefetch: true })}
      />

      {retryMutation.error && (
        <Card className="border-destructive/30 p-4 text-sm text-destructive">
          {retryMutation.error.message}
        </Card>
      )}

      {runQuery.run?.status === 'COMPLETED' && (
        <div className="space-y-4">
          <Card className="space-y-4 border-green-500/20 bg-green-500/5 p-6">
            <div>
              <h2 className="font-semibold text-foreground">Strategy ready</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your generated strategy is ready to review.
              </p>
            </div>
            <Button asChild className="w-full gap-2" size="lg">
              <Link href={`/app/campaigns/${campaignId}/strategy`}>
                View strategy <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>

          <SectionReviewRunWorkspace runId={runId} role="CLIENT" />
        </div>
      )}

      {runQuery.run?.status === 'BLOCKED_AWAITING_REVIEW' && (
        <SectionReviewRunWorkspace runId={runId} role="CLIENT" />
      )}
    </div>
  );
}
