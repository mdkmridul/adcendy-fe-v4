'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { RunStatusCard } from '@/shared/components/run/RunStatusCard';
import { useRunPolling } from '@/shared/run/useRunPolling';
import { intelligenceRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type { IntelligenceSnapshot } from '@/shared/types/intelligence';

export default function IntelligencePage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const campaignId = params?.campaignId as string;
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  // Fetch snapshot history
  const { data: snapshots, isLoading: isLoadingSnapshots } = useQuery({
    queryKey: queryKeys.intelligence.list(campaignId),
    queryFn: () => intelligenceRepository.listSnapshots(campaignId),
    enabled: !!campaignId,
  });

  // Get selected snapshot
  const selectedSnapshot = snapshots?.find(s => s.id === selectedSnapshotId);

  // Poll active refresh
  const { run: pollingSnapshot, isPolling } = useRunPolling<IntelligenceSnapshot>({
    runId: snapshotId,
    queryKeyBase: 'intelligence-snapshot',
    fetchRun: (id) => intelligenceRepository.getSnapshot(id),
    enabled: !!snapshotId,
    intervalMs: 2500,
    onSucceeded: () => {
      // Refresh snapshot list after success
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.list(campaignId) });
    },
  });

  // Auto-hide success card after 3 seconds and select new snapshot
  useEffect(() => {
    if (pollingSnapshot?.status === 'SUCCEEDED') {
      const timer = setTimeout(() => {
        setSnapshotId(null);
        setSelectedSnapshotId(pollingSnapshot.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pollingSnapshot?.status, pollingSnapshot?.id]);

  // Auto-select latest snapshot on load
  useEffect(() => {
    if (snapshots && snapshots.length > 0 && !selectedSnapshotId && !snapshotId) {
      setSelectedSnapshotId(snapshots[0].id);
    }
  }, [snapshots, selectedSnapshotId, snapshotId]);

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: () => intelligenceRepository.refreshSnapshot(campaignId),
    onSuccess: (data) => {
      setSnapshotId(data.snapshotId);
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.list(campaignId) });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const statusConfig = {
    RUNNING: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600', label: 'Running' },
    SUCCEEDED: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-600', label: 'Succeeded' },
    FAILED: { icon: XCircle, color: 'bg-red-500/10 text-red-600', label: 'Failed' },
    QUEUED: { icon: Clock, color: 'bg-blue-500/10 text-blue-600', label: 'Queued' },
  };

  if (!campaignId) {
    return (
      <div className="p-6">
        <p className="text-destructive">Campaign ID not found</p>
      </div>
    );
  }

  const showRunCard = snapshotId && (isPolling || pollingSnapshot?.status === 'RUNNING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
            Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Market signals, competitor activity, and industry trends
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending || isPolling}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
          Refresh Intelligence
        </Button>
      </div>

      {/* Run status card */}
      {showRunCard && (
        <RunStatusCard
          title="Intelligence Refresh"
          description="Gathering latest market signals and competitor insights..."
          run={pollingSnapshot}
          isLoading={false}
          isPolling={isPolling}
          showTimestamps
        />
      )}

      {/* No snapshots state */}
      {!isLoadingSnapshots && (!snapshots || snapshots.length === 0) && !snapshotId && (
        <Card className="p-8 text-center border border-border bg-card">
          <p className="text-muted-foreground mb-4">
            No intelligence snapshots yet. Refresh to gather market insights.
          </p>
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Intelligence
          </Button>
        </Card>
      )}

      {/* Main content - History + Viewer */}
      {snapshots && snapshots.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Snapshot history */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Snapshot History
              </h2>
              <ScrollArea className="h-[600px] border border-border rounded-lg bg-card">
                <div className="space-y-2 p-4">
                  {snapshots.map((snapshot) => {
                    const config = statusConfig[snapshot.status];
                    const StatusIcon = config.icon;
                    const isSelected = selectedSnapshotId === snapshot.id;

                    return (
                      <Button
                        key={snapshot.id}
                        variant={isSelected ? 'default' : 'ghost'}
                        onClick={() => setSelectedSnapshotId(snapshot.id)}
                        className="w-full justify-start h-auto py-3 px-3"
                      >
                        <div className="flex flex-col items-start gap-2 w-full">
                          <div className="flex items-center gap-2 w-full">
                            <StatusIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-xs">
                              {new Date(snapshot.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <Badge
                            className={`${config.color} text-xs`}
                            variant="outline"
                          >
                            {config.label}
                          </Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main content - Snapshot viewer */}
          <div className="lg:col-span-3">
            {selectedSnapshot && (
              <Card className="p-6 border border-border bg-card">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground">
                        {new Date(selectedSnapshot.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </h2>
                      {selectedSnapshot.ttlHours && (
                        <Badge variant="outline" className="text-xs">
                          TTL: {selectedSnapshot.ttlHours}h
                        </Badge>
                      )}
                    </div>
                    {selectedSnapshot.summary.freshnessNote && (
                      <p className="text-sm text-muted-foreground italic">
                        {selectedSnapshot.summary.freshnessNote}
                      </p>
                    )}
                  </div>

                  {/* Market signals */}
                  {selectedSnapshot.status === 'SUCCEEDED' && (
                    <>
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">
                          Market Signals
                        </h3>
                        <ul className="space-y-3">
                          {selectedSnapshot.summary.bullets.map((bullet, i) => (
                            <li key={i} className="text-sm text-foreground flex gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span className="flex-1">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sources */}
                      {selectedSnapshot.summary.sources && selectedSnapshot.summary.sources.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                            Data Sources
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSnapshot.summary.sources.map((source, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {source.source}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Fetched on{' '}
                            {new Date(selectedSnapshot.summary.sources[0].fetchedAt).toLocaleString('en-US')}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Failed state */}
                  {selectedSnapshot.status === 'FAILED' && (
                    <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">
                        Intelligence refresh failed. Please try again.
                      </p>
                    </div>
                  )}

                  {/* Running state */}
                  {selectedSnapshot.status === 'RUNNING' && (
                    <div className="p-4 rounded-md bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600">
                        Intelligence refresh in progress...
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
