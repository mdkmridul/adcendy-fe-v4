'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { weeklyMetricsSchema, type WeeklyMetricsInput } from '@/shared/schemas/weekly';
import { weeklyRepository } from '@/shared/api/repositories';
import type { ID } from '@/shared/types/common';

interface WeeklySubmissionFormProps {
  campaignId: ID;
  weekStart: string;
  onSubmitSuccess: (processingRunId: ID) => void;
  isLoading?: boolean;
}

export function WeeklySubmissionForm({
  campaignId,
  weekStart,
  onSubmitSuccess,
  isLoading = false,
}: WeeklySubmissionFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WeeklyMetricsInput>({
    resolver: zodResolver(weeklyMetricsSchema),
    defaultValues: {
      spend: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      purchases: undefined,
      revenue: undefined,
    },
  });

  const { mutate: submitWeekly, isPending } = useMutation({
    mutationFn: (metrics: WeeklyMetricsInput) =>
      weeklyRepository.upsertSubmission(campaignId, weekStart, { metrics }),
    onSuccess: (result) => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      reset();
      onSubmitSuccess(result.processingRunId);
    },
  });

  const onSubmit = (data: WeeklyMetricsInput) => {
    submitWeekly(data);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6 border border-border bg-card space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">Weekly Metrics</h3>
        <p className="text-sm text-muted-foreground mt-1">Week of {formatDate(weekStart)}</p>
      </div>

      {showSuccess && (
        <Alert className="border border-green-500/20 bg-green-500/5">
          <AlertDescription className="text-green-700">Week submitted successfully</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Spend */}
          <div className="space-y-2">
            <Label htmlFor="spend">Spend ($)</Label>
            <Input
              id="spend"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register('spend')}
              className="bg-background"
            />
            {errors.spend && <p className="text-xs text-destructive">{errors.spend.message}</p>}
          </div>

          {/* Impressions */}
          <div className="space-y-2">
            <Label htmlFor="impressions">Impressions</Label>
            <Input
              id="impressions"
              type="number"
              min="0"
              placeholder="0"
              {...register('impressions')}
              className="bg-background"
            />
            {errors.impressions && <p className="text-xs text-destructive">{errors.impressions.message}</p>}
          </div>

          {/* Clicks */}
          <div className="space-y-2">
            <Label htmlFor="clicks">Clicks</Label>
            <Input
              id="clicks"
              type="number"
              min="0"
              placeholder="0"
              {...register('clicks')}
              className="bg-background"
            />
            {errors.clicks && <p className="text-xs text-destructive">{errors.clicks.message}</p>}
          </div>

          {/* Leads */}
          <div className="space-y-2">
            <Label htmlFor="leads">Leads</Label>
            <Input
              id="leads"
              type="number"
              min="0"
              placeholder="0"
              {...register('leads')}
              className="bg-background"
            />
            {errors.leads && <p className="text-xs text-destructive">{errors.leads.message}</p>}
          </div>

          {/* Purchases (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="purchases">Purchases (optional)</Label>
            <Input
              id="purchases"
              type="number"
              min="0"
              placeholder="0"
              {...register('purchases')}
              className="bg-background"
            />
            {errors.purchases && <p className="text-xs text-destructive">{errors.purchases.message}</p>}
          </div>

          {/* Revenue (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue ($) (optional)</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register('revenue')}
              className="bg-background"
            />
            {errors.revenue && <p className="text-xs text-destructive">{errors.revenue.message}</p>}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || isLoading}
          className="w-full"
        >
          {isPending ? 'Submitting...' : 'Submit Week'}
        </Button>
      </form>
    </Card>
  );
}
