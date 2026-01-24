import type { ID, ISODateTime, RunStatus } from '@/shared/types/common';

export interface RunEntity {
  id: ID;
  status: RunStatus;
  createdAt?: ISODateTime;
  updatedAt?: ISODateTime;
  errorMessage?: string | null;
}

export interface RunFetchResult<T extends RunEntity = RunEntity> {
  run: T;
}

export interface RunPollingConfig<T extends RunEntity = RunEntity> {
  runId: ID | null;
  queryKeyBase: string;
  fetchRun: (runId: ID) => Promise<T>;
  enabled?: boolean;
  intervalMs?: number;
  onSucceeded?: (run: T) => void;
  onFailed?: (run: T, error?: string) => void;
}

export interface RunRetryResult {
  runId?: ID;
}
