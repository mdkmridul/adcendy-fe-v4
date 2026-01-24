'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { RunStatusCard } from '@/shared/components/run/RunStatusCard';
import { useRunPolling } from '@/shared/run/useRunPolling';
import { WeeklySubmissionForm } from '@/shared/components/weekly/WeeklySubmissionForm';
import { WeeklyHistoryList } from '@/shared/components/weekly/WeeklyHistoryList';
import { DerivedMetricsSummary } from '@/shared/components/weekly/DerivedMetricsSummary';
import { weeklyRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type { WeeklyProcessingRun } from '@/shared/types/weekly';

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function formatWeekStart(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function WeeklyPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);
  const [processingRunId, setProcessingRunId] = useState<string | null>(null);

  // Fetch submissions list
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: queryKeys.weekly.submissions(campaignId),
    queryFn: () => weeklyRepository.listSubmissions(campaignId),
  });

  // Fetch selected week submission
  const { data: selectedSubmission } = useQuery({
    queryKey: queryKeys.weekly.byWeek(campaignId, selectedWeekStart),
    queryFn: () => weeklyRepository.getWeeklySubmission(campaignId, selectedWeekStart),
    enabled: !!selectedWeekStart,
  });

  // Poll processing run status
  const { run: processingRun, isPolling } = useRunPolling<WeeklyProcessingRun>({
    runId: processingRunId,
    queryKeyBase: 'weekly-processing',
    fetchRun: (id) => weeklyRepository.getProcessingRun(id),
    enabled: !!processingRunId,
    intervalMs: 2000,
  });

  // Fetch derived metrics for selected week
  const { data: derivedSummary, isLoading: derivedLoading } = useQuery({
    queryKey: queryKeys.weekly.derived(campaignId, selectedWeekStart),
    queryFn: () => weeklyRepository.getDerivedSummary(campaignId, selectedWeekStart),
    enabled: !!selectedSubmission && !!selectedWeekStart,
  });

  // Auto-hide processing run card when succeeded
  useEffect(() => {
    if (processingRun?.status === 'SUCCEEDED') {
      const timer = setTimeout(() => {
        setProcessingRunId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [processingRun?.status]);

  const handleWeekSelect = (weekStart: string) => {
    setSelectedWeekStart(weekStart);
    setProcessingRunId(null);
  };

  const handleSubmitSuccess = (newProcessingRunId: string) => {
    setProcessingRunId(newProcessingRunId);
  };

  const allSubmissions = useMemo(
    () => submissions || [],
    [submissions]
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Weekly Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor weekly performance metrics and processing</p>
        </div>

        {/* Empty State */}
        {!submissionsLoading && allSubmissions.length === 0 && !selectedWeekStart && (
          <Card className="p-12 text-center border border-border bg-card">
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-muted-foreground">No weekly submissions yet. Start by submitting this week's metrics.</p>
            </div>
          </Card>
        )}

        {/* 2-Column Layout */}
        {allSubmissions.length > 0 || selectedWeekStart ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: History */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Week History</h2>
                <WeeklyHistoryList
                  submissions={allSubmissions}
                  selectedWeekStart={selectedWeekStart}
                  onSelectWeek={handleWeekSelect}
                  isLoading={submissionsLoading}
                />
              </div>
            </div>

            {/* Right Column: Form + Status + Metrics */}
            <div className="lg:col-span-3 space-y-6">
              {/* Form */}
              <WeeklySubmissionForm
                campaignId={campaignId}
                weekStart={selectedWeekStart}
                onSubmitSuccess={handleSubmitSuccess}
                isLoading={submissionsLoading}
              />

              {/* Processing Status Card */}
              {processingRun && processingRunId && (
                <RunStatusCard
                  title="Weekly Processing"
                  description="Analyzing your weekly metrics..."
                  run={processingRun}
                  isLoading={false}
                  isPolling={isPolling}
                />
              )}

              {/* Derived Metrics Summary */}
              {selectedSubmission && (
                <DerivedMetricsSummary
                  summary={derivedSummary || null}
                  isLoading={derivedLoading}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Suspense>
  );
}
