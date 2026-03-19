import type { ID, ISODateTime } from './common';

export interface CampaignDocument {
  id: ID;
  title: string;
  description: string | null;
  fileName: string;
  fileSizeBytes: number | null;
  createdAt: ISODateTime | null;
  availableAt: ISODateTime | null;
  contentType: string | null;
  rawStatus: string | null;
}

export interface CampaignDocumentList {
  items: CampaignDocument[];
  total: number;
}

export interface CampaignDocumentDownload {
  status: string | null;
  url: string | null;
  expiresAt: ISODateTime | null;
}
