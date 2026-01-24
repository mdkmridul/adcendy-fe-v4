'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Download } from 'lucide-react';
import { StrategyVersionList } from '@/shared/components/strategy/StrategyVersionList';
import { StrategyViewer } from '@/shared/components/strategy/StrategyViewer';
import { StrategyFeedbackForm } from '@/shared/components/strategy/StrategyFeedbackForm';
import { strategyRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';

export default function StrategyPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Fetch versions
  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: queryKeys.strategy.versions(campaignId),
    queryFn: () => strategyRepository.listVersions(campaignId),
  });

  // Fetch selected or latest version
  const selectedOrLatestVersionId = useMemo(() => {
    if (selectedVersionId) return selectedVersionId;
    if (versions && versions.length > 0) {
      return versions[0].id;
    }
    return null;
  }, [selectedVersionId, versions]);

  const { data: selectedVersion, isLoading: versionLoading, error: versionError } = useQuery({
    queryKey: queryKeys.strategy.version(selectedOrLatestVersionId),
    queryFn: () =>
      selectedOrLatestVersionId ? strategyRepository.getVersion(selectedOrLatestVersionId) : null,
    enabled: !!selectedOrLatestVersionId,
  });

  const handleGenerateNew = async () => {
    try {
      const result = await strategyRepository.startRun(campaignId);
      router.push(`/app/campaigns/${campaignId}/strategy/runs/${result.strategyRunId}`);
    } catch (err) {
      console.error('Failed to start strategy run:', err);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId);
  };

  const isLoading = versionsLoading || versionLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Strategy</h1>
          <p className="text-muted-foreground mt-1">Market analysis & go-to-market planning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled size="icon" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
          </Button>
          <Button onClick={handleGenerateNew} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate New
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!versionsLoading && (!versions || versions.length === 0) && (
        <Card className="p-12 text-center border border-border bg-card">
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-muted-foreground">No strategy generated yet.</p>
            <Button onClick={handleGenerateNew} size="lg" className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Generate First Strategy
            </Button>
          </div>
        </Card>
      )}

      {/* Main Layout */}
      {versions && versions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Version List */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Version History</h2>
              <StrategyVersionList
                versions={versions}
                selectedVersionId={selectedOrLatestVersionId || undefined}
                onSelect={handleVersionSelect}
                isLoading={versionsLoading}
              />
            </div>
          </div>

          {/* Main: Viewer + Feedback */}
          <div className="lg:col-span-3 space-y-6">
            <StrategyViewer
              version={selectedVersion || null}
              isLoading={versionLoading}
              error={versionError instanceof Error ? versionError.message : null}
            />

            {selectedVersion && (
              <StrategyFeedbackForm
                strategyVersionId={selectedVersion.id}
                versionNumber={selectedVersion.version}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
