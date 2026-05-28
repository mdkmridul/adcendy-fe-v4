'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { SectionReviewRunWorkspace } from '@/shared/components/ops/SectionReviewRunWorkspace';
import { RunTelemetryDrilldown } from '@/shared/components/ops/RunTelemetryDrilldown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminRunTelemetryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = params?.runId as string;
  const requestedTab = searchParams.get('tab');
  const defaultWorkspaceTab =
    requestedTab === 'overview' || requestedTab === 'input-details' || requestedTab === 'strategy'
      ? requestedTab
      : 'overview';
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading admin run telemetry...</div>;
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
                This telemetry view is only available to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/app/admin/health">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Campaign Health
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Admin Run Workspace</h1>
          <p className="text-muted-foreground">
            Full-access review workspace with section actions plus telemetry diagnostics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <SectionReviewRunWorkspace runId={runId} role="ADMIN" defaultTab={defaultWorkspaceTab} />
        </TabsContent>

        <TabsContent value="telemetry">
          <RunTelemetryDrilldown
            runId={runId}
            backHref="/app/admin/health"
            backLabel="Back to Campaign Health"
            heading="Admin Run Telemetry Drilldown"
            description="Events, phase rollups, and aggregate telemetry for the selected pipeline run."
            showAdminHealthLink
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
