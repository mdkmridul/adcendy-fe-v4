'use client';

import { Card } from '@/components/ui/card';
import { StrategyContentRenderer } from './StrategyContentRenderer';
import type { StrategyVersion } from '@/shared/types/strategy';

interface StrategyViewerProps {
  version: StrategyVersion | null;
  isLoading?: boolean;
  error?: string | null;
}

export function StrategyViewer({ version, isLoading, error }: StrategyViewerProps) {
  if (error) {
    return (
      <Card className="p-8 border border-destructive/20 bg-destructive/5 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse h-32 bg-muted" />
        ))}
      </div>
    );
  }

  if (!version) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Select a version to view</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Strategy Report</h2>
        <span className="text-sm text-muted-foreground">v{version.version}</span>
      </div>

      {version.sections.map((section) => (
        <Card key={section.key} className="p-6 border border-border bg-card">
          <h3 className="font-semibold text-lg text-foreground mb-4">{section.title}</h3>
          <div className="space-y-3">
            <StrategyContentRenderer content={section.content} />
          </div>
        </Card>
      ))}
    </div>
  );
}
