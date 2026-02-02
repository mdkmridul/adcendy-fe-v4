import { z } from 'zod';

// Step 1: Business Context (matches StrategyWizardStep1RequestDto)
export const step1Schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').optional().or(z.literal('')),
  marketLocation: z.string().min(2, 'Market location must be at least 2 characters').optional().or(z.literal('')),
  businessType: z.enum(['SERVICE', 'PRODUCT', 'ECOMMERCE', 'SAAS']).optional().or(z.literal('')),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

// Step 2: Offer (matches StrategyWizardStep2RequestDto)
export const step2Schema = z.object({
  offerSummary: z.string().min(10, 'Offer summary must be at least 10 characters').optional().or(z.literal('')),
  priceRange: z.string().min(1, 'Price range is required').optional().or(z.literal('')),
  differentiators: z.array(z.string()).optional().default([]),
  constraints: z.array(z.string()).optional().default([]),
});

// Step 3: Audience (matches StrategyWizardStep3RequestDto)
export const step3Schema = z.object({
  targetPersona: z.string().min(10, 'Target persona must be at least 10 characters').optional().or(z.literal('')),
  language: z.string().min(1, 'Language is required').optional().or(z.literal('')),
  painPoints: z.array(z.string()).optional().default([]),
  desiredOutcome: z.string().min(10, 'Desired outcome must be at least 10 characters').optional().or(z.literal('')),
});

// Step 4: Preview/Confirmation (matches StrategyWizardStep4RequestDto)
export const step4Schema = z.object({
  confirmBusinessInfo: z.boolean().optional(),
  confirmOffer: z.boolean().optional(),
  confirmAudience: z.boolean().optional(),
  readyToGenerate: z.boolean().optional(),
  committedAt: z.string().optional(),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
