'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { SectionReviewRunWorkspace } from '@/shared/components/ops/SectionReviewRunWorkspace';
import { RunTelemetryDrilldown } from '@/shared/components/ops/RunTelemetryDrilldown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReviewerRunTelemetryPage() {
  const params = useParams();
  const runId = params?.runId as string;
  const { user, isLoading } = useAuth();
  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading run telemetry...</div>;
  }

  if (!isOpsRole) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                This workspace is available to reviewer and admin users.
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
        <Link href="/app/reviewer/strategy-reviews">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Reviewer Inbox
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Run Workspace</h1>
          <p className="text-muted-foreground">
            Workspace-first review surface with inputs and sections, plus telemetry for run diagnostics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <SectionReviewRunWorkspace
            runId={runId}
            role={user?.role === 'ADMIN' ? 'ADMIN' : 'REVIEWER'}
          />
        </TabsContent>

        <TabsContent value="telemetry">
          <RunTelemetryDrilldown
            runId={runId}
            backHref="/app/reviewer/strategy-reviews"
            backLabel="Back to Reviewer Inbox"
            heading="Run Telemetry"
            description="Telemetry context for this pipeline run."
            showAdminHealthLink={user?.role === 'ADMIN'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
