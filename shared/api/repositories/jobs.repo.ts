import type { JobRun, JobRunDetail, ListJobRunsParams } from '@/shared/types/jobs';
import type { ID } from '@/shared/types/common';
import { jobsMockAdapter } from '../mock/jobs.mock';
import { jobsRealAdapter } from '../real/jobs.real';

import ENV from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = ENV.API.isMock ? jobsMockAdapter : jobsRealAdapter;

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Jobs Repository] Using adapter:', ENV.API.dataSource);
}

export const jobsRepository = {
  async listJobRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    return adapter.listJobRuns(params);
  },

  async getJobRunDetail(jobRunId: ID): Promise<JobRunDetail> {
    return adapter.getJobRunDetail(jobRunId);
  },
};
