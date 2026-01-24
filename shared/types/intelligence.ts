import type { ID, ISODateTime, RunStatus } from './common';

export interface IntelligenceSnapshot {
  id: ID;
  campaignId: ID;
  status: RunStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  summary: {
    bullets: string[];
    sources: Array<{
      source: string;
      fetchedAt: ISODateTime;
    }>;
    freshnessNote?: string;
  };
  ttlHours?: number;
}

export interface RefreshSnapshotResponse {
  runId: ID;
  snapshotId: ID;
}
