'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionStatusBadge, type SectionReadinessStatus } from './campaign-ui';

export interface ReadinessSummaryItem {
  label: string;
  status: SectionReadinessStatus;
  detail?: string;
}

export function ReadinessSummaryCard({
  title,
  description,
  items,
  ctaLabel,
  onCtaClick,
  ctaDisabled,
  footer,
}: {
  title: string;
  description?: string;
  items: ReadinessSummaryItem[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
  footer?: ReactNode;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-space-grotesk text-2xl">{title}</CardTitle>
            {description ? <CardDescription className="max-w-2xl text-sm">{description}</CardDescription> : null}
          </div>

          {ctaLabel && onCtaClick ? (
            <Button onClick={onCtaClick} disabled={ctaDisabled} className="min-w-[180px]">
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <SectionStatusBadge status={item.status} />
              </div>
              {item.detail ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p> : null}
            </div>
          ))}
        </div>
        {footer}
      </CardContent>
    </Card>
  );
}
