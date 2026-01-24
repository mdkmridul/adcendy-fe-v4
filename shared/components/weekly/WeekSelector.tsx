'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WeekSelectorProps {
  weeks: string[]; // Array of weekStart strings (YYYY-MM-DD)
  selectedWeek: string;
  onSelectWeek: (weekStart: string) => void;
  isLoading?: boolean;
  label?: string;
}

export function WeekSelector({
  weeks,
  selectedWeek,
  onSelectWeek,
  isLoading = false,
  label = 'Select Week',
}: WeekSelectorProps) {
  const formatWeekDisplay = (weekStart: string) => {
    const date = new Date(weekStart);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="text-sm text-muted-foreground">No weeks available</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={selectedWeek} onValueChange={onSelectWeek}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a week" />
        </SelectTrigger>
        <SelectContent>
          {weeks.map((week) => (
            <SelectItem key={week} value={week}>
              Week of {formatWeekDisplay(week)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
