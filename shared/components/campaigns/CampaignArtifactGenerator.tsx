'use client';

import { FileOutput, LoaderCircle } from 'lucide-react';
import { useRequestCampaignPdfArtifact } from '@/hooks/useCampaignDocuments';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function CampaignArtifactGenerator({
  campaignId,
  runId,
}: {
  campaignId: string;
  runId?: string | null;
}) {
  const { toast } = useToast();
  const generate = useRequestCampaignPdfArtifact(campaignId);

  const handleGenerate = async () => {
    try {
      const result = await generate.mutateAsync(runId ?? undefined);
      toast({
        title: 'PDF generation queued',
        description: `Artifact ${result.artifactId} is ${result.status.toLowerCase()}.`,
      });
    } catch (error) {
      const requestId = error instanceof ApiError ? error.requestId : undefined;
      toast({
        variant: 'destructive',
        title: 'PDF generation failed',
        description: `${error instanceof Error ? error.message : 'Please try again.'}${
          requestId ? ` Request ID: ${requestId}` : ''
        }`,
      });
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileOutput className="h-5 w-5" />
          Generate PDF artifact
        </CardTitle>
        <CardDescription>
          Admin-only manual operation. When no run is selected, Backend uses
          the latest completed strategy draft.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          disabled={generate.isPending}
          onClick={() => void handleGenerate()}
          type="button"
          variant="outline"
        >
          {generate.isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileOutput className="mr-2 h-4 w-4" />
          )}
          {generate.isPending ? 'Queuing PDF...' : 'Generate PDF'}
        </Button>
      </CardContent>
    </Card>
  );
}
