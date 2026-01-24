import type { ID, ISODateTime } from './common';

export interface Campaign {
  id: ID;
  name: string;
  city: string;
  niche: string;
  website?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CreateCampaignPayload {
  name: string;
  city: string;
  niche: string;
  website?: string | null;
}

export interface UpdateCampaignPayload {
  name?: string;
  city?: string;
  niche?: string;
  website?: string | null;
}
