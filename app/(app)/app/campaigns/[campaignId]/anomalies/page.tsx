'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { weeklyRepository } from '@/shared/api/repositories/weekly.repo';
import { queryKeys } from '@/shared/api/queryKeys';
import { WeekSelector } from '@/shared/components/weekly/WeekSelector';
import { AnomalyList } from '@/shared/components/weekly/AnomalyList';
import { Card } from '@/components/ui/card';

export default function AnomaliesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params?.campaignId as string;

  // Get week from query param or use latest
  const weekStartParam = searchParams?.get('weekStart');

  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(
    weekStartParam || null
  );

  // Fetch all submissions to get available weeks
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: queryKeys.weekly.submissions(campaignId),
    queryFn: () => weeklyRepository.listSubmissions(campaignId),
    enabled: !!campaignId,
  });

  // Get available weeks
  const availableWeeks = useMemo(() => {
    if (!submissions) return [];
    return submissions.map((s) => s.weekStart).sort((a, b) => b.localeCompare(a));
  }, [submissions]);

  // Auto-select latest week if none selected
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekStart) {
      setSelectedWeekStart(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeekStart]);

  // Fetch anomalies for selected week
  const { data: anomalies, isLoading: isLoadingAnomalies } = useQuery({
    queryKey: queryKeys.weekly.anomalies(campaignId, selectedWeekStart || undefined),
    queryFn: () =>
      weeklyRepository.listAnomalies(campaignId, selectedWeekStart || undefined),
    enabled: !!campaignId && !!selectedWeekStart,
  });

  if (!campaignId) {
    return (
      <div className="p-6">
        <p className="text-destructive">Campaign ID not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Anomalies
        </h1>
        <p className="text-muted-foreground mt-1">
          Review detected anomalies and performance issues from weekly metrics
        </p>
      </div>

      {/* No submissions state */}
      {!isLoadingSubmissions && availableWeeks.length === 0 && (
        <Card className="p-8 text-center border border-border bg-card">
          <p className="text-muted-foreground">
            No weekly submissions yet. Submit weekly metrics to see anomaly detection.
          </p>
        </Card>
      )}

      {/* Main content */}
      {availableWeeks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Week selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <WeekSelector
                weeks={availableWeeks}
                selectedWeek={selectedWeekStart || ''}
                onSelectWeek={setSelectedWeekStart}
                isLoading={isLoadingSubmissions}
                label="Select Week"
              />
            </div>
          </div>

          {/* Main content - Anomaly list */}
          <div className="lg:col-span-3">
            <Card className="p-6 border border-border bg-card">
              {selectedWeekStart && (
                <div className="mb-4 pb-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">
                    Week of{' '}
                    {new Date(selectedWeekStart).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h2>
                </div>
              )}
              <AnomalyList
                anomalies={anomalies || []}
                isLoading={isLoadingAnomalies}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
