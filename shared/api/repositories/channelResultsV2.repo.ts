import { createRuntimeRepositoryAdapter } from '@/lib/env';
import { channelResultsV2MockAdapter } from '@/shared/api/mock/channelResultsV2.mock';
import { channelResultsV2RealAdapter } from '@/shared/api/real/channelResultsV2.real';

const adapter = createRuntimeRepositoryAdapter(
  channelResultsV2MockAdapter,
  channelResultsV2RealAdapter,
);

export const channelResultsV2Repository = {
  record: (...args: Parameters<typeof channelResultsV2RealAdapter.record>) =>
    adapter.record(...args),
  list: (...args: Parameters<typeof channelResultsV2RealAdapter.list>) =>
    adapter.list(...args),
  remove: (...args: Parameters<typeof channelResultsV2RealAdapter.remove>) =>
    adapter.remove(...args),
};
