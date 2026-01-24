import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').min(3, 'Name must be at least 3 characters'),
  city: z.string().min(1, 'City is required').min(2, 'City must be at least 2 characters'),
  niche: z.string().min(1, 'Niche is required').min(2, 'Niche must be at least 2 characters'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
