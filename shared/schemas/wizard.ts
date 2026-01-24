import { z } from 'zod';

export const step1Schema = z.object({
  city: z.string().min(2, 'City must be at least 2 characters'),
  niche: z.string().min(2, 'Niche must be at least 2 characters'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  budgetMonthly: z.coerce.number().positive('Budget must be positive').optional().or(z.literal('')),
});

export const step2Schema = z.object({
  offerType: z.enum(['SERVICE', 'PRODUCT', 'SUBSCRIPTION']),
  offerSummary: z.string().min(10, 'Offer summary must be at least 10 characters').max(200, 'Max 200 characters'),
  pricePoint: z.coerce.number().positive('Price must be positive').optional().or(z.literal('')),
  usp: z.string().max(200, 'Max 200 characters').optional().or(z.literal('')),
});

export const step3Schema = z.object({
  audienceType: z.enum(['LOCAL', 'NICHE_ONLINE', 'MASS']),
  customerPersona: z.string().min(10, 'Persona must be at least 10 characters').max(300, 'Max 300 characters'),
  objective: z.enum(['LEADS', 'SALES', 'AWARENESS']),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
