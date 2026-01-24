import type { ID, ISODateTime, RunStatus } from './common';

export interface WeeklySubmission {
  id: ID;
  campaignId: ID;
  weekStart: string; // YYYY-MM-DD
  metrics: {
    spend: number; // required, >= 0
    impressions: number; // required, >= 0
    clicks: number; // required, >= 0
    leads: number; // required, >= 0
    purchases?: number; // optional, >= 0
    revenue?: number; // optional, >= 0
  };
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface WeeklyProcessingRun {
  id: ID;
  campaignId: ID;
  weekStart: string; // YYYY-MM-DD
  status: RunStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  errorMessage?: string | null;
}

export interface DerivedMetricsSummary {
  campaignId: ID;
  weekStart: string;
  inputs: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    purchases?: number;
    revenue?: number;
  };
  derived: {
    ctr?: number; // clicks / impressions
    cpl?: number; // spend / leads
    cvr?: number; // leads / clicks
    roas?: number; // revenue / spend
    cpa?: number; // spend / purchases
  };
  notes?: string[];
}

export interface Anomaly {
  id: ID;
  campaignId: ID;
  weekStart: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  metricKey: string;
  message: string;
  createdAt: ISODateTime;
}

export interface TweakRun {
  id: ID;
  campaignId: ID;
  weekStart: string;
  status: RunStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  errorMessage?: string | null;
}

export interface TweakItem {
  id: ID;
  tweakRunId: ID;
  category: string;
  title: string;
  recommendation: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  reviewerNote?: string | null;
}

export interface UpsertWeeklySubmissionPayload {
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    purchases?: number;
    revenue?: number;
  };
}

export interface UpdateTweakStatusPayload {
  status: 'APPROVED' | 'REJECTED';
  reviewerNote?: string;
}
