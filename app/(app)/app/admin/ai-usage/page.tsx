'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/hooks/useAuth';
import { aiUsageRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { DollarSign, Zap, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AiUsagePage() {
  const { user } = useAuth();
  const [windowDays, setWindowDays] = useState<number>(14);

  const isAdmin = user?.role === 'ADMIN';

  const { data: usageSummary, isLoading } = useQuery({
    queryKey: queryKeys.aiUsage.summary(windowDays),
    queryFn: () => aiUsageRepository.getAiUsageSummary({ windowDays }),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view AI usage data. Only ADMIN users can access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/admin" className="text-sm text-primary hover:underline">
              ← Back to Admin
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCost = usageSummary?.daily.reduce((sum, day) => sum + day.totalCostUsd, 0) || 0;
  const totalTokens = usageSummary?.daily.reduce((sum, day) => sum + day.totalTokens, 0) || 0;
  const totalRequests = usageSummary?.daily.reduce((sum, day) => sum + day.totalRequests, 0) || 0;

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Usage & Cost Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI API consumption, token usage, and costs across campaigns and users
          </p>
        </div>
        <Select value={windowDays.toString()} onValueChange={(val) => setWindowDays(Number(val))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {usageSummary?.daily.length || 0} days
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(totalTokens / 1_000_000).toFixed(2)}M tokens processed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg {Math.round(totalRequests / (usageSummary?.daily.length || 1))} per day
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Breakdown</CardTitle>
          <CardDescription>
            Request volume, token consumption, and costs per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageSummary?.daily.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No usage data available for this time window
                      </TableCell>
                    </TableRow>
                  ) : (
                    usageSummary?.daily.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">{day.totalRequests.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{day.totalTokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${day.totalCostUsd.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Spenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spenders</CardTitle>
          <CardDescription>
            Campaigns and users with highest AI consumption in this time window
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageSummary?.topSpenders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No spender data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    usageSummary?.topSpenders.map((spender, index) => (
                      <TableRow key={spender.entityId}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{spender.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {spender.entityType === 'CAMPAIGN' ? 'Campaign' : 'User'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{spender.totalRequests.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{spender.totalTokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${spender.totalCostUsd.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
