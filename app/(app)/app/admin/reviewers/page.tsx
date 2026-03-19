'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, UserPlus2 } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  useCreateReviewerAccount,
  useReviewerAccounts,
  useUpdateReviewerStatus,
} from '@/hooks/useAdminReview';
import { useToast } from '@/hooks/use-toast';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const createReviewerSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  displayName: z.string().trim().optional(),
});

type CreateReviewerInput = z.infer<typeof createReviewerSchema>;

function formatDate(value?: string | null) {
  if (!value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminReviewersPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const reviewersQuery = useReviewerAccounts(search.trim() || undefined);
  const createReviewerMutation = useCreateReviewerAccount();
  const updateReviewerStatusMutation = useUpdateReviewerStatus();

  const form = useForm<CreateReviewerInput>({
    resolver: zodResolver(createReviewerSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  });

  const onSubmit = async (values: CreateReviewerInput) => {
    try {
      const reviewer = await createReviewerMutation.mutateAsync({
        email: values.email,
        password: values.password,
        displayName: values.displayName?.trim() || undefined,
      });

      form.reset();
      toast({
        title: 'Reviewer created',
        description: reviewer?.email
          ? `${reviewer.email} can now sign in as a reviewer.`
          : 'The reviewer account was created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to create reviewer',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading reviewer management...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Only administrators can create reviewer accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
          <span>/</span>
          <span>Reviewers</span>
        </div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Reviewer Management</h1>
        <p className="text-muted-foreground">
          Reviewers are provisioned by admins only. Create accounts here and track recent reviewer access.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus2 className="h-5 w-5" />
              Create Reviewer
            </CardTitle>
            <CardDescription>Uses `POST /v1/admin/users/reviewers`.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="reviewer@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimum 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional reviewer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createReviewerMutation.isPending}>
                  {createReviewerMutation.isPending ? 'Creating...' : 'Create Reviewer'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Recent Reviewers</CardTitle>
            <CardDescription>
              Optional reviewer list from existing admin user APIs, filtered to the reviewer role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by email or display name"
            />
            {reviewersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading reviewers...</p>
            ) : reviewersQuery.error ? (
              <p className="text-sm text-destructive">
                {reviewersQuery.error instanceof Error ? reviewersQuery.error.message : 'Failed to load reviewers.'}
              </p>
            ) : (
              <div className="space-y-3">
                {(reviewersQuery.data ?? []).map((reviewer) => (
                  <div
                    key={reviewer.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{reviewer.displayName ?? reviewer.email}</p>
                      <p className="text-sm text-muted-foreground">{reviewer.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(reviewer.createdAt)}. Last login {formatDate(reviewer.lastLoginAt)}.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ReviewStatusBadge status={reviewer.status} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updateReviewerStatusMutation.isPending}
                        onClick={async () => {
                          try {
                            const nextStatus = reviewer.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                            await updateReviewerStatusMutation.mutateAsync({
                              reviewerId: reviewer.id,
                              payload: {
                                status: nextStatus,
                                reason: 'Updated from admin reviewer management.',
                              },
                            });

                            toast({
                              title: `Reviewer ${nextStatus.toLowerCase()}`,
                              description: `${reviewer.email} is now ${nextStatus.toLowerCase()}.`,
                            });
                          } catch (error) {
                            toast({
                              title: 'Failed to update reviewer',
                              description: error instanceof Error ? error.message : 'Please try again.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        {reviewer.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
                {(reviewersQuery.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviewers found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
