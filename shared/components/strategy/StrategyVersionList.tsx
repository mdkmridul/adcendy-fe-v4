'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { StrategyVersion } from '@/shared/types/strategy';

interface StrategyVersionListProps {
  versions: StrategyVersion[];
  selectedVersionId?: string;
  onSelect: (versionId: string) => void;
  isLoading?: boolean;
}

export function StrategyVersionList({
  versions,
  selectedVersionId,
  onSelect,
  isLoading,
}: StrategyVersionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 h-12 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="p-4 text-center text-sm text-muted-foreground">
        No versions yet
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <Card
          key={version.id}
          className={`p-4 cursor-pointer transition-colors border ${
            selectedVersionId === version.id
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelect(version.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-foreground">v{version.version}</span>
                {selectedVersionId === version.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
