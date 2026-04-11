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
import {
  BUSINESS_MODEL_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  MARKET_SCOPE_OPTIONS,
} from '@/shared/types/campaign';

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
      title: '',
      marketLocation: '',
      businessType: undefined,
      businessModel: undefined,
      marketScope: undefined,
      websiteUrl: '',
    },
  });

  const onSubmit = async (data: CreateCampaignInput) => {
    try {
      setIsLoading(true);
      
      const newCampaign = await campaignsRepository.createCampaign({
        title: data.title,
        marketLocation: data.marketLocation,
        businessType: data.businessType,
        businessModel: data.businessModel,
        marketScope: data.marketScope,
        websiteUrl: data.websiteUrl?.trim() || undefined,
      });

      // Invalidate campaigns list to refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(newCampaign.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(newCampaign.id) }),
      ]);

      // Update last campaign and continue into step 1 so the user can finish the full context contract
      setLastCampaignId(newCampaign.id);
      router.push(`/app/campaigns?draftCampaignId=${newCampaign.id}&wizardStep=1`);

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
      <DialogContent className="sm:max-w-[560px]">
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SaaS Product Launch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_MODEL_OPTIONS.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="marketScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Scope</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select market scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MARKET_SCOPE_OPTIONS.map((option) => (
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
              name="websiteUrl"
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
