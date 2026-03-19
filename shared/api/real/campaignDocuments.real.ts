import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  CampaignDocument,
  CampaignDocumentDownload,
  CampaignDocumentList,
} from '@/shared/types/campaignDocument';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getRecordValue(record: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function getString(record: UnknownRecord, keys: string[]): string | null {
  return readString(getRecordValue(record, keys));
}

function getNumber(record: UnknownRecord, keys: string[]): number | null {
  return readNumber(getRecordValue(record, keys));
}

function deriveTitle(fileName: string, fallbackId: string): string {
  if (!fileName) {
    return `Document ${fallbackId}`;
  }

  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  const normalized = withoutExtension.replace(/[-_]+/g, ' ').trim();

  return normalized.length > 0 ? normalized : fileName;
}

function mapDocumentDto(input: unknown): CampaignDocument {
  if (!isRecord(input)) {
    throw new Error('Unexpected campaign document payload.');
  }

  const fileRecord = isRecord(input.file) ? input.file : null;
  const id = getString(input, ['id', 'documentId', 'artifactId']);

  if (!id) {
    throw new Error('Campaign document is missing an id.');
  }

  const fileName =
    getString(input, ['fileName', 'filename']) ??
    (fileRecord ? getString(fileRecord, ['name', 'fileName', 'filename']) : null) ??
    'document';

  const title =
    getString(input, ['title', 'name', 'label']) ??
    deriveTitle(fileName, id);

  return {
    id,
    title,
    description: getString(input, ['description', 'summary', 'notes']),
    fileName,
    fileSizeBytes:
      getNumber(input, ['fileSizeBytes', 'sizeBytes', 'fileSize', 'size']) ??
      (fileRecord ? getNumber(fileRecord, ['sizeBytes', 'fileSizeBytes', 'size']) : null),
    createdAt: getString(input, ['createdAt', 'uploadedAt', 'uploadDate', 'uploadedDate']),
    availableAt: getString(input, ['availableAt', 'availabilityDate', 'availableFrom', 'publishAt']),
    contentType:
      getString(input, ['contentType', 'mimeType']) ??
      (fileRecord ? getString(fileRecord, ['contentType', 'mimeType']) : null),
    rawStatus: getString(input, ['status', 'availabilityStatus']),
  };
}

function extractItems(payload: unknown): { items: unknown[]; total: number | null } {
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length };
  }

  if (!isRecord(payload)) {
    throw new Error('Unexpected campaign documents response.');
  }

  const itemsCandidate = getRecordValue(payload, ['items', 'documents', 'artifacts']);
  const metaCandidate = isRecord(payload.meta) ? payload.meta : null;
  const total =
    (metaCandidate ? getNumber(metaCandidate, ['total']) : null) ??
    getNumber(payload, ['total']);

  if (Array.isArray(itemsCandidate)) {
    return { items: itemsCandidate, total };
  }

  throw new Error('Campaign documents response did not include a document list.');
}

function extractDownload(payload: unknown): CampaignDocumentDownload {
  if (!isRecord(payload)) {
    throw new Error('Unexpected campaign document download response.');
  }

  return {
    status: getString(payload, ['status']),
    url: getString(payload, ['url', 'signedUrl', 'downloadUrl']),
    expiresAt: getString(payload, ['expiresAt', 'downloadExpiresAt']),
  };
}

export const campaignDocumentsRealAdapter = {
  async listDocuments(campaignId: string): Promise<CampaignDocumentList> {
    const response = await http<ApiResponse<unknown>>(`/v1/campaigns/${campaignId}/documents`);
    const { items, total } = extractItems(response.data);

    return {
      items: items.map(mapDocumentDto),
      total: total ?? items.length,
    };
  },

  async getDownload(campaignId: string, documentId: string): Promise<CampaignDocumentDownload> {
    const response = await http<ApiResponse<unknown>>(
      `/v1/campaigns/${campaignId}/documents/${documentId}/download`,
    );

    return extractDownload(response.data);
  },
};
