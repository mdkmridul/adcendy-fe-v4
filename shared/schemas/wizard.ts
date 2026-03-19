import { z } from 'zod';
import {
  BUSINESS_MODEL_VALUES,
  BUSINESS_TYPE_VALUES,
  MARKET_SCOPE_VALUES,
} from '@/shared/types/campaign';

// Step 1: Business Context (matches StrategyWizardStep1RequestDto)
export const step1Schema = z.object({
  title: z.string().min(1, 'Title is required').min(2, 'Title must be at least 2 characters'),
  marketLocation: z.string().min(1, 'Market location is required').min(2, 'Market location must be at least 2 characters'),
  businessType: z.enum(BUSINESS_TYPE_VALUES, { required_error: 'Business type is required' }),
  businessModel: z.enum(BUSINESS_MODEL_VALUES, { required_error: 'Business model is required' }),
  marketScope: z.enum(MARKET_SCOPE_VALUES, { required_error: 'Market scope is required' }),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

// Step 2: Offer (matches StrategyWizardStep2RequestDto)
export const step2Schema = z.object({
  offerSummary: z.string().min(10, 'Offer summary must be at least 10 characters'),
  priceRange: z.string().min(1, 'Price range is required'),
  differentiators: z.array(z.string()).optional().default([]),
  constraints: z.array(z.string()).optional().default([]),
});

// Step 3: Audience (matches StrategyWizardStep3RequestDto)
export const step3Schema = z.object({
  targetPersona: z.string().min(10, 'Target persona must be at least 10 characters'),
  language: z.string().min(1, 'Language is required'),
  painPoints: z.array(z.string()).optional().default([]),
  desiredOutcome: z.string().min(10, 'Desired outcome must be at least 10 characters'),
});

// Step 4: Preview/Confirmation (matches StrategyWizardStep4RequestDto)
export const step4Schema = z.object({
  confirmBusinessInfo: z.boolean().optional(),
  confirmOffer: z.boolean().optional(),
  confirmAudience: z.boolean().optional(),
  readyToGenerate: z.boolean().optional(),
  dataConsentOptIn: z.boolean().optional().default(true),
  committedAt: z.string().optional(),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
