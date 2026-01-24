import type { JobRun, JobRunDetail, ListJobRunsParams } from '@/shared/types/jobs';
import type { ID } from '@/shared/types/common';
import { jobsMockAdapter } from '../mock/jobs.mock';
import { jobsRealAdapter } from '../real/jobs.real';

import ENV from '@/lib/env';

const adapter = ENV.API.isMock ? jobsMockAdapter : jobsRealAdapter;

export const jobsRepository = {
  async listJobRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    return adapter.listJobRuns(params);
  },

  async getJobRunDetail(jobRunId: ID): Promise<JobRunDetail> {
    return adapter.getJobRunDetail(jobRunId);
  },
};
