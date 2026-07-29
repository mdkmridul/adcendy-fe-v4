import ENV from '@/lib/env';
import { runsV2MockAdapter } from '@/shared/api/mock/runsV2.mock';
import { runsV2RealAdapter } from '@/shared/api/real/runsV2.real';

const adapter = ENV.API.isMock ? runsV2MockAdapter : runsV2RealAdapter;

export const runsV2Repository = {
  start: adapter.start.bind(adapter),
  getStatus: adapter.getStatus.bind(adapter),
  retry: adapter.retry.bind(adapter),
  recover: adapter.recover.bind(adapter),
};
