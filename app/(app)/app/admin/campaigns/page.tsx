'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useAdminCampaigns } from '@/hooks/useAdminReview';
import { formatCampaignStatus, type CampaignStatus } from '@/shared/types/campaign';
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminCampaignsPage() {
  const { user, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | CampaignStatus>('ALL');
  const campaignsQuery = useAdminCampaigns({
    q: search.trim() || undefined,
    status: status === 'ALL' ? undefined : status,
    pageSize: 25,
  }, user?.role === 'ADMIN');

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading admin campaigns...</div>;
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
                Only administrators can inspect campaign operations.
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
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Admin Campaigns</h1>
        <p className="text-muted-foreground">
          Operational campaign list backed by `GET /v1/admin/campaigns`.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search by title or owner and filter by campaign status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-2">
            <Label htmlFor="campaign-search">Search</Label>
            <Input
              id="campaign-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Campaign title or owner"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger id="campaign-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="DRAFT">In Setup</SelectItem>
                <SelectItem value="SUBMITTED_FOR_REVIEW">Generating</SelectItem>
                <SelectItem value="IN_REVIEW">Under Review</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="FAILED">Needs Attention</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>Open the admin detail page or jump directly into review visibility.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          ) : campaignsQuery.error ? (
            <p className="text-sm text-destructive">
              {campaignsQuery.error instanceof Error ? campaignsQuery.error.message : 'Failed to load campaigns.'}
            </p>
          ) : (campaignsQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No admin-visible campaigns matched the current filter set.</p>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(campaignsQuery.data ?? []).map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-xs text-muted-foreground">{campaign.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ReviewStatusBadge
                          status={campaign.status}
                          label={formatCampaignStatus(campaign.status)}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{campaign.ownerEmail}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(campaign.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/campaigns/${campaign.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Detail
                            </Button>
                          </Link>
                          <Link href={`/admin/campaigns/${campaign.id}/review`}>
                            <Button variant="ghost" size="sm">
                              Review
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
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
  );
}
