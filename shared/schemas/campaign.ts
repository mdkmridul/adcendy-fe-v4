import { z } from 'zod';
import {
  BUSINESS_MODEL_VALUES,
  BUSINESS_TYPE_VALUES,
  MARKET_SCOPE_VALUES,
} from '@/shared/types/campaign';

export const createCampaignSchema = z.object({
  title: z.string().min(1, 'Campaign title is required').min(3, 'Title must be at least 3 characters'),
  marketLocation: z.string().min(1, 'Market location is required').min(2, 'Market location must be at least 2 characters'),
  businessType: z.enum(BUSINESS_TYPE_VALUES, {
    required_error: 'Business type is required',
  }),
  businessModel: z.enum(BUSINESS_MODEL_VALUES, {
    required_error: 'Business model is required',
  }),
  marketScope: z.enum(MARKET_SCOPE_VALUES, {
    required_error: 'Market scope is required',
  }),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
