'use client';

import { useParams } from 'next/navigation';
import { PipelineRunPageV2 } from '@/shared/components/run/PipelineRunPageV2';

export default function PipelineRunStatusPage() {
  const params = useParams();
  return (
    <PipelineRunPageV2
      campaignId={params.campaignId as string}
      runId={params.runId as string}
    />
  );
}
