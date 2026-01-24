'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WeeklySubmission } from '@/shared/types/weekly';

interface WeeklyHistoryListProps {
  submissions: WeeklySubmission[];
  selectedWeekStart: string;
  onSelectWeek: (weekStart: string) => void;
  isLoading?: boolean;
}

export function WeeklyHistoryList({
  submissions,
  selectedWeekStart,
  onSelectWeek,
  isLoading = false,
}: WeeklyHistoryListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card className="p-4 border border-border bg-card space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card className="p-4 border border-border bg-card text-center">
        <p className="text-sm text-muted-foreground">No weekly submissions yet</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px] border border-border rounded-lg bg-card">
      <div className="space-y-2 p-4">
        {submissions.map((submission) => (
          <Button
            key={submission.id}
            variant={selectedWeekStart === submission.weekStart ? 'default' : 'ghost'}
            onClick={() => onSelectWeek(submission.weekStart)}
            className="w-full justify-between h-auto py-3 px-3"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-medium">
                Week of {formatDate(submission.weekStart)}
              </span>
              <Badge variant="outline" className="text-xs">
                {submission.metrics.clicks} clicks
              </Badge>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
