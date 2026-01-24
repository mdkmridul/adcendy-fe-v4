'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock, TrendingUp, Info } from 'lucide-react';
import type { TweakItem } from '@/shared/types/weekly';

interface TweaksListProps {
  tweaks: TweakItem[];
  isLoading?: boolean;
  showActions?: boolean;
  onApprove?: (tweakId: string) => void;
  onReject?: (tweakId: string) => void;
}

const impactConfig = {
  HIGH: {
    color: 'bg-green-500/10 text-green-600',
    label: 'High Impact',
    icon: TrendingUp,
  },
  MEDIUM: {
    color: 'bg-blue-500/10 text-blue-600',
    label: 'Medium Impact',
    icon: TrendingUp,
  },
  LOW: {
    color: 'bg-gray-500/10 text-gray-600',
    label: 'Low Impact',
    icon: TrendingUp,
  },
};

const statusConfig = {
  PROPOSED: {
    color: 'bg-yellow-500/10 text-yellow-700',
    icon: Clock,
    label: 'Proposed',
    variant: 'secondary' as const,
  },
  APPROVED: {
    color: 'bg-green-500/10 text-green-700',
    icon: CheckCircle2,
    label: 'Approved',
    variant: 'default' as const,
  },
  REJECTED: {
    color: 'bg-red-500/10 text-red-700',
    icon: XCircle,
    label: 'Rejected',
    variant: 'destructive' as const,
  },
};

export function TweaksList({
  tweaks,
  isLoading = false,
  showActions = false,
  onApprove,
  onReject,
}: TweaksListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (tweaks.length === 0) {
    return (
      <Alert className="border-border bg-card">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No tweaks available for this week. Generate tweaks to see recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  // Group by category
  const grouped = tweaks.reduce((acc, tweak) => {
    if (!acc[tweak.category]) {
      acc[tweak.category] = [];
    }
    acc[tweak.category].push(tweak);
    return acc;
  }, {} as Record<string, TweakItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{category}</h3>
            <Badge variant="outline" className="text-xs">
              {items.length}
            </Badge>
          </div>

          <div className="grid gap-3">
            {items.map((tweak) => {
              const impactCfg = impactConfig[tweak.impact];
              const statusCfg = statusConfig[tweak.status];
              const StatusIcon = statusCfg.icon;

              return (
                <Card key={tweak.id} className="p-4 border border-border bg-card">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-medium text-foreground">
                            {tweak.title}
                          </h4>
                          <Badge className={impactCfg.color}>{impactCfg.label}</Badge>
                          <Badge
                            variant={statusCfg.variant}
                            className="flex items-center gap-1"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tweak.recommendation}
                        </p>
                        {tweak.reviewerNote && (
                          <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Reviewer Note:</span>{' '}
                              {tweak.reviewerNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {showActions && tweak.status === 'PROPOSED' && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onApprove?.(tweak.id)}
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject?.(tweak.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
