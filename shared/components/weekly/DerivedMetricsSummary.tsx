'use client';

import { Card } from '@/components/ui/card';
import type { DerivedMetricsSummary as DerivedMetricsSummaryType } from '@/shared/types/weekly';

interface DerivedMetricsSummaryProps {
  summary: DerivedMetricsSummaryType | null;
  isLoading?: boolean;
}

export function DerivedMetricsSummary({ summary, isLoading = false }: DerivedMetricsSummaryProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border border-border bg-card space-y-6">
        <h3 className="font-semibold text-foreground">Derived Metrics</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const formatNumber = (num: number | undefined, decimals = 2) => {
    if (num === undefined || num === null || !isFinite(num)) {
      return '—';
    }
    if (decimals === 0) {
      return Math.round(num).toLocaleString();
    }
    return num.toFixed(decimals);
  };

  const formatPercent = (num: number | undefined) => {
    if (num === undefined || num === null || !isFinite(num)) {
      return '—';
    }
    return `${(num * 100).toFixed(2)}%`;
  };

  const formatCurrency = (num: number | undefined) => {
    if (num === undefined || num === null || !isFinite(num)) {
      return '—';
    }
    return `$${num.toFixed(2)}`;
  };

  return (
    <Card className="p-6 border border-border bg-card space-y-6">
      {/* Inputs Summary */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Inputs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Spend</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(summary.inputs.spend)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Impressions</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(summary.inputs.impressions, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Clicks</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(summary.inputs.clicks, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Leads</p>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(summary.inputs.leads, 0)}
            </p>
          </div>
          {summary.inputs.revenue !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(summary.inputs.revenue)}
              </p>
            </div>
          )}
          {summary.inputs.purchases !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Purchases</p>
              <p className="text-lg font-semibold text-foreground">
                {formatNumber(summary.inputs.purchases, 0)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Derived Metrics */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          {summary.derived.ctr !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CTR</p>
              <p className="text-lg font-semibold text-foreground">
                {formatPercent(summary.derived.ctr)}
              </p>
            </div>
          )}
          {summary.derived.cpl !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CPL</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(summary.derived.cpl)}
              </p>
            </div>
          )}
          {summary.derived.cvr !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CVR</p>
              <p className="text-lg font-semibold text-foreground">
                {formatPercent(summary.derived.cvr)}
              </p>
            </div>
          )}
          {summary.derived.roas !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ROAS</p>
              <p className="text-lg font-semibold text-foreground">
                {formatNumber(summary.derived.roas)}x
              </p>
            </div>
          )}
          {summary.derived.cpa !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CPA</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(summary.derived.cpa)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
