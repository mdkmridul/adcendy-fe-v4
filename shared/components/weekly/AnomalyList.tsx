'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Anomaly } from '@/shared/types/weekly';

interface AnomalyListProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
}

const severityConfig = {
  HIGH: {
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: AlertCircle,
    label: 'High',
    badgeVariant: 'destructive' as const,
  },
  MEDIUM: {
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: AlertTriangle,
    label: 'Medium',
    badgeVariant: 'default' as const,
  },
  LOW: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Info,
    label: 'Low',
    badgeVariant: 'outline' as const,
  },
};

export function AnomalyList({ anomalies, isLoading = false }: AnomalyListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <Alert className="border-border bg-card">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No anomalies detected for this week. All metrics are performing within expected ranges.
        </AlertDescription>
      </Alert>
    );
  }

  // Group anomalies by severity
  const grouped = {
    HIGH: anomalies.filter((a) => a.severity === 'HIGH'),
    MEDIUM: anomalies.filter((a) => a.severity === 'MEDIUM'),
    LOW: anomalies.filter((a) => a.severity === 'LOW'),
  };

  return (
    <div className="space-y-6">
      {(['HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => {
        const items = grouped[severity];
        if (items.length === 0) return null;

        const config = severityConfig[severity];
        const Icon = config.icon;

        return (
          <div key={severity} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
              <h3 className="text-sm font-semibold text-foreground">
                {config.label} Severity
              </h3>
              <Badge variant={config.badgeVariant} className="ml-1">
                {items.length}
              </Badge>
            </div>

            <div className="grid gap-3">
              {items.map((anomaly) => (
                <Card
                  key={anomaly.id}
                  className={`p-4 border ${config.color}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {anomaly.metricKey}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {anomaly.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Detected on {new Date(anomaly.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
