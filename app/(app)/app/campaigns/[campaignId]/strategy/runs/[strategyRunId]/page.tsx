'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { RunStatusCard } from '@/shared/components/run/RunStatusCard';
import { useRunPolling } from '@/shared/run/useRunPolling';
import { strategyRepository } from '@/shared/api/repositories';
import type { StrategyRun } from '@/shared/types/strategy';

export default function StrategyRunStatusPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const strategyRunId = params?.strategyRunId as string;

  const { run, isLoading, isPolling, error } = useRunPolling<StrategyRun>({
    runId: strategyRunId,
    queryKeyBase: 'strategy-run',
    fetchRun: (id) => strategyRepository.getRun(id),
    enabled: !!strategyRunId,
    intervalMs: 2500,
    onSucceeded: () => {
      console.log('[v0] Strategy run succeeded');
    },
  });

  const { mutate: retryRun, isPending: isRetrying } = useMutation({
    mutationFn: () => strategyRepository.startRun(campaignId),
    onSuccess: (result) => {
      router.push(`/app/campaigns/${campaignId}/strategy/runs/${result.strategyRunId}`);
    },
  });

  const handleRetry = async () => {
    retryRun();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Strategy Generation</h1>
        <p className="text-muted-foreground">Watch as we analyze your market opportunity in real-time</p>
      </div>

      <RunStatusCard
        title="Generating Strategy"
        description="AI is processing your market data and creating strategic recommendations..."
        run={run}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        showTimestamps
        isPolling={isPolling}
      />

      {run?.status === 'SUCCEEDED' && (
        <Card className="p-6 border border-green-500/20 bg-green-500/5 space-y-4">
          <div>
            <h2 className="font-semibold text-foreground">Strategy Ready</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your market strategy has been generated and is ready for review.
            </p>
          </div>
          <Link href={`/app/campaigns/${campaignId}/strategy`}>
            <Button className="w-full gap-2" size="lg">
              View Strategy <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      )}

      {run?.status === 'FAILED' && (
        <Card className="p-6 border border-destructive/20 bg-destructive/5 space-y-4">
          <div>
            <h2 className="font-semibold text-destructive">Generation Failed</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {run.errorMessage || 'An error occurred while generating the strategy. Please try again.'}
            </p>
          </div>
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            variant="outline"
            className="w-full bg-transparent"
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </Card>
      )}
    </div>
  );
}
