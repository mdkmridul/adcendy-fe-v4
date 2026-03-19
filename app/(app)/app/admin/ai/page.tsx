'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Activity, AlertCircle, ArrowRight, BrainCircuit, DollarSign, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useAdminAiCalls } from '@/hooks/useAdminReview';
import { aiUsageRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminAiPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [days, setDays] = useState(14);
  const [userId, setUserId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [status, setStatus] = useState('ALL');
  const [operation, setOperation] = useState('ALL');
  const [model, setModel] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const normalizedUserId = userId.trim() || undefined;

  const summaryQuery = useQuery({
    queryKey: queryKeys.aiUsage.summary(days, normalizedUserId),
    queryFn: () => aiUsageRepository.getAiUsageSummary({ days, userId: normalizedUserId }),
    enabled: isAdmin,
  });

  const dailyUsageQuery = useQuery({
    queryKey: queryKeys.aiUsage.daily(days, days, normalizedUserId),
    queryFn: () => aiUsageRepository.getDailyUsage({ days, limit: days, userId: normalizedUserId }),
    enabled: isAdmin,
  });

  const aiCallsQuery = useAdminAiCalls({
    userId: normalizedUserId,
    days,
    campaignId: campaignId.trim() || undefined,
    entityType: campaignId.trim() ? 'CAMPAIGN' : undefined,
    entityId: campaignId.trim() || undefined,
    status: status === 'ALL' ? undefined : status,
    operation: operation === 'ALL' ? undefined : operation,
    model: model.trim() || undefined,
    limit: 20,
    page: 1,
  }, isAdmin);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading AI monitoring...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                Only administrators can inspect AI telemetry and cost usage.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grouped = Object.entries(summaryQuery.data?.grouped ?? {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">AI Monitoring</h1>
          <p className="text-muted-foreground">
            Usage summary, daily rollups, and call-level traces for the current admin window and selected user scope.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void Promise.all([summaryQuery.refetch(), dailyUsageQuery.refetch(), aiCallsQuery.refetch()]);
          }}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Uses `GET /v1/admin/ai/usage/summary`, `.../usage/daily`, `.../calls`, and `.../calls/:id` with optional user scoping.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-6">
          <div className="space-y-2">
            <Label htmlFor="ai-window">Window</Label>
            <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
              <SelectTrigger id="ai-window">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Optional user id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-id">Campaign ID</Label>
            <Input
              id="campaign-id"
              value={campaignId}
              onChange={(event) => setCampaignId(event.target.value)}
              placeholder="Optional campaign id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="call-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="call-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="STARTED">Started</SelectItem>
                <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="call-operation">Operation</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger id="call-operation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All operations</SelectItem>
                <SelectItem value="CHAT">Chat</SelectItem>
                <SelectItem value="EMBEDDING">Embedding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="call-model">Model</Label>
            <Input
              id="call-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Optional model"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total calls</p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{summaryQuery.data?.totalCalls ?? '-'}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total tokens</p>
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold">
              {summaryQuery.data ? summaryQuery.data.totalTokens.toLocaleString() : '-'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total cost</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold">
              {summaryQuery.data ? formatCurrency(summaryQuery.data.totalCost) : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Daily Usage</CardTitle>
              <CardDescription>Daily AI rollups for the selected time window.</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyUsageQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading daily usage...</p>
              ) : dailyUsageQuery.error ? (
                <p className="text-sm text-destructive">
                  {dailyUsageQuery.error instanceof Error ? dailyUsageQuery.error.message : 'Failed to load daily usage.'}
                </p>
              ) : (dailyUsageQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No usage data was returned for this window.</p>
              ) : (
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Calls</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(dailyUsageQuery.data ?? []).map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell className="text-right">{entry.calls}</TableCell>
                          <TableCell className="text-right">{entry.totalTokens.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.cost)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>AI Calls</CardTitle>
              <CardDescription>Call-level monitoring across campaigns and models.</CardDescription>
            </CardHeader>
            <CardContent>
              {aiCallsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading AI calls...</p>
              ) : aiCallsQuery.error ? (
                <p className="text-sm text-destructive">
                  {aiCallsQuery.error instanceof Error ? aiCallsQuery.error.message : 'Failed to load AI calls.'}
                </p>
              ) : (aiCallsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No AI calls matched the current filters.</p>
              ) : (
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(aiCallsQuery.data ?? []).map((call) => (
                        <TableRow key={call.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{call.model}</p>
                              <p className="text-xs text-muted-foreground">
                                {call.provider ?? 'Unknown provider'} | {call.operation}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ReviewStatusBadge status={call.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(call.startedAt)}</TableCell>
                          <TableCell>{call.totalTokens?.toLocaleString() ?? 'Unknown'}</TableCell>
                          <TableCell>{call.cost != null ? formatCurrency(call.cost) : 'Unknown'}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/admin/ai/${call.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Grouped Summary</CardTitle>
            <CardDescription>Backend-provided grouped totals from the summary endpoint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading grouped totals...</p>
            ) : grouped.length === 0 ? (
              <p className="text-sm text-muted-foreground">No grouped totals were returned.</p>
            ) : (
              grouped.map(([groupKey, totals]) => (
                <div key={groupKey} className="rounded-lg border border-border bg-background p-4">
                  <p className="font-medium">{groupKey}</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p>Calls {totals.calls.toLocaleString()}</p>
                    <p>Tokens {totals.tokens.toLocaleString()}</p>
                    <p>Cost {formatCurrency(totals.cost)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
