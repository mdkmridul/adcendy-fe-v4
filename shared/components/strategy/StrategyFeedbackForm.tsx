'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { StrategyFeedbackSchema, type StrategyFeedbackFormData } from '@/shared/schemas/strategy';
import { strategyRepository } from '@/shared/api/repositories';
import type { ID } from '@/shared/types/common';

interface StrategyFeedbackFormProps {
  campaignId: ID;
  strategyVersionId: ID;
  versionNumber: number;
}

export function StrategyFeedbackForm({
  campaignId,
  strategyVersionId,
  versionNumber,
}: StrategyFeedbackFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StrategyFeedbackFormData>({
    resolver: zodResolver(StrategyFeedbackSchema),
  });

  const selectedRating = watch('rating');
  const feedbackNote = watch('note');

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: (data: StrategyFeedbackFormData) =>
      strategyRepository.submitFeedback(campaignId, strategyVersionId, data),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    },
  });

  const onSubmit = (data: StrategyFeedbackFormData) => {
    submitFeedback(data);
  };

  return (
    <Card className="p-6 border border-border bg-card">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Feedback for Strategy v{versionNumber}
          </p>
          <p className="text-xs text-muted-foreground">How helpful was this strategy analysis?</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={selectedRating === 'UP' ? 'default' : 'outline'}
              size="lg"
              className="flex-1 gap-2"
              onClick={() => {
                const radioInput = document.querySelector(
                  'input[value="UP"]'
                ) as HTMLInputElement;
                if (radioInput) radioInput.checked = true;
              }}
            >
              <ThumbsUp className="w-5 h-5" />
              Helpful
            </Button>
            <Button
              type="button"
              variant={selectedRating === 'DOWN' ? 'default' : 'outline'}
              size="lg"
              className="flex-1 gap-2"
              onClick={() => {
                const radioInput = document.querySelector(
                  'input[value="DOWN"]'
                ) as HTMLInputElement;
                if (radioInput) radioInput.checked = true;
              }}
            >
              <ThumbsDown className="w-5 h-5" />
              Not Helpful
            </Button>
            <input type="hidden" {...register('rating')} />
          </div>

          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}

          <textarea
            {...register('note')}
            placeholder="Optional: Tell us why (max 500 characters)"
            className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            maxLength={500}
          />

          {errors.note && (
            <p className="text-xs text-destructive">{errors.note.message}</p>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending || submitted} className="flex-1 gap-2">
              {submitted ? (
                <>
                  <Check className="w-4 h-4" />
                  Thanks for feedback!
                </>
              ) : isPending ? (
                'Submitting...'
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
