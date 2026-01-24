import { z } from 'zod';

export const StrategyFeedbackSchema = z.object({
  rating: z.enum(['UP', 'DOWN'], { message: 'Please select a rating' }),
  note: z.string().max(500, 'Note must be 500 characters or less').optional(),
});

export type StrategyFeedbackFormData = z.infer<typeof StrategyFeedbackSchema>;
