import type { components } from '@/src/generated/openapi';
import { http } from '@/shared/api/http';
import type {
  CampaignRunRecoveryMode,
  CampaignRunRecoveryV2,
  PipelineRunRetryV2,
  PipelineRunStartV2,
  PipelineRunStatusResponseV2,
} from '@/shared/types/runsV2';

type ResponseEnvelope<T> = {
  data: T;
  meta?: components['schemas']['ResponseMeta'];
  success?: true;
};

function unwrap<T>(response: ResponseEnvelope<T> | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response
  ) {
    return (response as ResponseEnvelope<T>).data;
  }
  return response as T;
}

export const runsV2RealAdapter = {
  async start(
    campaignId: string,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<PipelineRunStartV2> {
    const response = await http<
      ResponseEnvelope<PipelineRunStartV2> | PipelineRunStartV2
    >('/api/v2/pipeline/runs', {
      method: 'POST',
      body: { campaignId },
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    });
    return unwrap(response);
  },

  async getStatus(
    runId: string,
    signal?: AbortSignal,
  ): Promise<PipelineRunStatusResponseV2> {
    const response = await http<
      ResponseEnvelope<PipelineRunStatusResponseV2> | PipelineRunStatusResponseV2
    >(`/api/v2/pipeline/runs/${encodeURIComponent(runId)}`, { signal });
    return unwrap(response);
  },

  async retry(
    runId: string,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<PipelineRunRetryV2> {
    const response = await http<
      ResponseEnvelope<PipelineRunRetryV2> | PipelineRunRetryV2
    >(`/api/v2/pipeline/runs/${encodeURIComponent(runId)}/retry`, {
      method: 'POST',
      body: {},
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    });
    return unwrap(response);
  },

  async recover(
    campaignId: string,
    mode: CampaignRunRecoveryMode,
    signal?: AbortSignal,
  ): Promise<CampaignRunRecoveryV2> {
    const response = await http<
      ResponseEnvelope<CampaignRunRecoveryV2> | CampaignRunRecoveryV2
    >(`/api/v2/campaigns/${encodeURIComponent(campaignId)}/runs/recovery`, {
      query: { mode },
      signal,
    });
    return unwrap(response);
  },
};
