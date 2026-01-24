'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyRepository } from '@/shared/api/repositories/weekly.repo';
import { queryKeys } from '@/shared/api/queryKeys';
import { useRunPolling } from '@/shared/run/useRunPolling';
import { useAuth } from '@/features/auth/useAuth';
import { WeekSelector } from '@/shared/components/weekly/WeekSelector';
import { TweaksList } from '@/shared/components/weekly/TweaksList';
import { RunStatusCard } from '@/shared/components/run/RunStatusCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, ArrowRight, Info } from 'lucide-react';
import type { TweakRun } from '@/shared/types/weekly';

export default function TweaksPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params?.campaignId as string;
  const { user } = useAuth();

  const isClient = user?.role === 'CLIENT';
  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  const weekStartParam = searchParams?.get('weekStart');
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(
    weekStartParam || null
  );
  const [tweakRunId, setTweakRunId] = useState<string | null>(null);

  // Fetch all submissions to get available weeks
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: queryKeys.weekly.submissions(campaignId),
    queryFn: () => weeklyRepository.listSubmissions(campaignId),
    enabled: !!campaignId,
  });

  const availableWeeks = useMemo(() => {
    if (!submissions) return [];
    return submissions.map((s) => s.weekStart).sort((a, b) => b.localeCompare(a));
  }, [submissions]);

  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekStart) {
      setSelectedWeekStart(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeekStart]);

  // Check for existing tweak run for the selected week
  const { data: existingRun } = useQuery<TweakRun | null>({
    queryKey: queryKeys.weekly.tweakRunByWeek(campaignId, selectedWeekStart || ''),
    queryFn: () => weeklyRepository.getTweakRun(campaignId, selectedWeekStart || ''),
    enabled: !!campaignId && !!selectedWeekStart,
  });

  // Set tweakRunId when existing run is found
  useEffect(() => {
    if (existingRun) {
      setTweakRunId(existingRun.id);
    }
  }, [existingRun]);

  // Poll tweak run
  const { run: tweakRun, isPolling } = useRunPolling<TweakRun>({
    runId: tweakRunId,
    queryKeyBase: 'tweak-run',
    fetchRun: (id) => weeklyRepository.getTweakRunById(id),
    enabled: !!tweakRunId,
    intervalMs: 2000,
  });

  // Auto-hide success card after 3 seconds
  useEffect(() => {
    if (tweakRun?.status === 'SUCCEEDED') {
      const timer = setTimeout(() => {
        // Keep the runId to show tweaks, just refresh the list
        queryClient.invalidateQueries({
          queryKey: queryKeys.weekly.tweaks(tweakRunId!),
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tweakRun?.status, tweakRunId, queryClient]);

  // Fetch tweak items
  const visibility = isClient ? 'APPROVED_ONLY' : 'ALL';
  const { data: tweaks, isLoading: isLoadingTweaks } = useQuery({
    queryKey: queryKeys.weekly.tweaks(tweakRunId || '', visibility),
    queryFn: () => weeklyRepository.listTweaks(tweakRunId!, visibility),
    enabled: !!tweakRunId && tweakRun?.status === 'SUCCEEDED',
  });

  // Start tweak run mutation
  const startTweakRunMutation = useMutation({
    mutationFn: () =>
      weeklyRepository.startTweakRun(campaignId, selectedWeekStart || ''),
    onSuccess: (data) => {
      setTweakRunId(data.tweakRunId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.weekly.tweakRunByWeek(campaignId, selectedWeekStart || ''),
      });
    },
  });

  const handleGenerateTweaks = () => {
    if (selectedWeekStart) {
      startTweakRunMutation.mutate();
    }
  };

  const handleGoToApprovals = () => {
    router.push(`/app/campaigns/${campaignId}/approvals?weekStart=${selectedWeekStart}`);
  };

  if (!campaignId) {
    return (
      <div className="p-6">
        <p className="text-destructive">Campaign ID not found</p>
      </div>
    );
  }

  const showGenerateButton =
    selectedWeekStart &&
    !tweakRun &&
    !startTweakRunMutation.isPending &&
    !isPolling;
  const showRunCard = tweakRun && (isPolling || tweakRun.status !== 'SUCCEEDED');
  const showTweaks = tweakRun?.status === 'SUCCEEDED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Tweaks
        </h1>
        <p className="text-muted-foreground mt-1">
          {isClient
            ? 'View approved tweak recommendations from your reviewer'
            : 'Generate and review AI-powered tweak recommendations for weekly optimization'}
        </p>
      </div>

      {/* No submissions state */}
      {!isLoadingSubmissions && availableWeeks.length === 0 && (
        <Card className="p-8 text-center border border-border bg-card">
          <p className="text-muted-foreground">
            No weekly submissions yet. Submit weekly metrics to generate tweaks.
          </p>
        </Card>
      )}

      {/* Main content */}
      {availableWeeks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <WeekSelector
                weeks={availableWeeks}
                selectedWeek={selectedWeekStart || ''}
                onSelectWeek={setSelectedWeekStart}
                isLoading={isLoadingSubmissions}
                label="Select Week"
              />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Generate tweaks button */}
            {showGenerateButton && !isClient && (
              <Card className="p-6 border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Generate Tweaks
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze week performance and generate optimization recommendations
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateTweaks}
                    disabled={startTweakRunMutation.isPending}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Tweaks
                  </Button>
                </div>
              </Card>
            )}

            {/* Run status card */}
            {showRunCard && (
              <RunStatusCard
                title="Generating Tweaks"
                description="Analyzing weekly performance and generating optimization recommendations..."
                run={tweakRun}
                isLoading={false}
                isPolling={isPolling}
              />
            )}

            {/* Tweaks list */}
            {showTweaks && (
              <Card className="p-6 border border-border bg-card">
                {selectedWeekStart && (
                  <div className="mb-6 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Week of{' '}
                          {new Date(selectedWeekStart).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isClient
                            ? 'Showing approved tweaks only'
                            : 'Showing all tweaks'}
                        </p>
                      </div>
                      {isReviewerOrAdmin && tweaks && tweaks.length > 0 && (
                        <Button
                          onClick={handleGoToApprovals}
                          variant="outline"
                          className="gap-2"
                        >
                          Go to Approvals
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {isClient && (!tweaks || tweaks.length === 0) ? (
                  <Alert className="border-border bg-card">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No approved tweaks yet. Your reviewer is reviewing the recommendations.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <TweaksList tweaks={tweaks || []} isLoading={isLoadingTweaks} />
                )}
              </Card>
            )}

            {/* No run yet */}
            {!showGenerateButton && !showRunCard && !showTweaks && !isClient && (
              <Card className="p-8 text-center border border-border bg-card">
                <p className="text-muted-foreground">
                  Select a week and generate tweaks to see recommendations.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
