import { createRuntimeRepositoryAdapter } from '@/lib/env';
import { runsV2MockAdapter } from '@/shared/api/mock/runsV2.mock';
import { runsV2RealAdapter } from '@/shared/api/real/runsV2.real';

const adapter = createRuntimeRepositoryAdapter(runsV2MockAdapter, runsV2RealAdapter);

export const runsV2Repository = {
  start: (...args: Parameters<typeof runsV2RealAdapter.start>) => adapter.start(...args),
  getStatus: (...args: Parameters<typeof runsV2RealAdapter.getStatus>) => adapter.getStatus(...args),
  retry: (...args: Parameters<typeof runsV2RealAdapter.retry>) => adapter.retry(...args),
  recover: (...args: Parameters<typeof runsV2RealAdapter.recover>) => adapter.recover(...args),
};
