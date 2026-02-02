'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createCampaignSchema, type CreateCampaignInput } from '@/shared/schemas/campaign';
import { campaignsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { useLastCampaign } from '@/hooks/useLastCampaign';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'SERVICE', label: 'Service' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'SAAS', label: 'SaaS' },
] as const;

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setLastCampaignId } = useLastCampaign();

  const form = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      city: '',
      niche: '',
      website: '',
    },
  });

  const onSubmit = async (data: CreateCampaignInput) => {
    try {
      setIsLoading(true);
      
      // Prepare payload matching OpenAPI CreateCampaignDto schema
      const payload: Record<string, any> = {
        title: data.name,
        marketLocation: data.city,
        businessType: data.niche, // Use businessType enum field
      };
      
      // Only add websiteUrl if it's a valid URL
      if (data.website && data.website.trim()) {
        payload.websiteUrl = data.website;
      }
      
      console.log('[CreateCampaign] Sending payload:', payload);
      
      const newCampaign = await campaignsRepository.createCampaign(payload);

      // Invalidate campaigns list to refetch
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() });

      // Update last campaign and navigate directly to Step 2
      setLastCampaignId(newCampaign.id);
      router.push(`/app/campaigns/${newCampaign.id}/setup/step-2`);

      // Close modal and reset form
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('[CreateCampaign] Failed to create campaign:', error);
      console.error('[CreateCampaign] Error details:', {
        kind: error?.kind,
        status: error?.status,
        message: error?.message,
        details: error?.details,
      });
      
      // Extract error message (auth errors are already handled by http module)
      let errorMessage = 'Failed to create campaign. Please try again.';
      
      // Check for validation errors
      if (error?.status === 400 && error?.details) {
        const validationErrors = error.details?.errors || error.details?.message;
        if (validationErrors) {
          errorMessage = typeof validationErrors === 'string' 
            ? validationErrors 
            : JSON.stringify(validationErrors);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      form.setError('root', {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Add a new market intelligence campaign for your business.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SaaS Product Launch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="bg-destructive/10 border border-destructive rounded p-3 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
