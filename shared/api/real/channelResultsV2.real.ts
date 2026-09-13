import type { components } from '@/src/generated/openapi';
import { http } from '@/shared/api/http';
import type {
  ChannelResultDeleteV2,
  ChannelResultInputV2,
  ChannelResultListFilterV2,
  ChannelResultListV2,
  ChannelResultViewV2,
} from '@/shared/types/channelResultsV2';

type ResponseEnvelope<T> = {
  data: T;
  meta?: components['schemas']['ResponseMeta'];
  success?: true;
};

function unwrap<T>(response: ResponseEnvelope<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ResponseEnvelope<T>).data;
  }
  return response as T;
}

function campaignPath(campaignId: string): string {
  return `/api/v2/channel-results/${encodeURIComponent(campaignId)}`;
}

/**
 * `PUT` records a period or replaces the same period, and `DELETE` removes one
 * result by id, so both are safe to replay once after a token refresh.
 */
export const channelResultsV2RealAdapter = {
  async record(
    campaignId: string,
    input: ChannelResultInputV2,
    signal?: AbortSignal,
  ): Promise<ChannelResultViewV2> {
    const response = await http<
      ResponseEnvelope<ChannelResultViewV2> | ChannelResultViewV2
    >(campaignPath(campaignId), {
      method: 'PUT',
      body: input,
      allowAuthReplay: true,
      signal,
    });
    return unwrap(response);
  },

  async list(
    campaignId: string,
    filter?: ChannelResultListFilterV2,
    signal?: AbortSignal,
  ): Promise<ChannelResultListV2> {
    const response = await http<
      ResponseEnvelope<ChannelResultListV2> | ChannelResultListV2
    >(campaignPath(campaignId), {
      query: { market: filter?.market, channelId: filter?.channelId },
      signal,
    });
    return unwrap(response);
  },

  async remove(
    campaignId: string,
    resultId: string,
    signal?: AbortSignal,
  ): Promise<ChannelResultDeleteV2> {
    const response = await http<
      ResponseEnvelope<ChannelResultDeleteV2> | ChannelResultDeleteV2
    >(`${campaignPath(campaignId)}/${encodeURIComponent(resultId)}`, {
      method: 'DELETE',
      allowAuthReplay: true,
      signal,
    });
    return unwrap(response);
  },
};
