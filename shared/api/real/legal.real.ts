import { http } from '../index';
import type { ApiResponse } from '../types';
import {
  LEGAL_CONSENT_STATUS_VALUES,
  LEGAL_CONSENT_TYPE_VALUES,
  LEGAL_DOCUMENT_TYPE_VALUES,
  LEGAL_DOCUMENT_TYPE_LABELS,
  type LegalAcceptDocumentsPayload,
  type LegalAcceptDocumentsResult,
  type LegalAcceptanceSource,
  type LegalConsentMutationPayload,
  type LegalConsentRecord,
  type LegalConsentStatus,
  type LegalConsentType,
  type LegalDocumentType,
  type LegalDocumentVersion,
} from '../../types/legal';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNullableString(value: unknown): string | null {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeDate(value: unknown): string | null {
  const normalized = normalizeNullableString(value);
  if (!normalized) {
    return null;
  }

  const timestamp = Date.parse(normalized);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function unwrapData<T>(response: ApiResponse<T> | T): T {
  if (isRecord(response) && Object.prototype.hasOwnProperty.call(response, 'data')) {
    return (response as unknown as ApiResponse<T>).data;
  }

  return response as T;
}

function normalizeDocumentType(
  value: unknown,
  fallback?: string,
): LegalDocumentType | null {
  const candidate = normalizeString(value || fallback);
  if (!candidate) {
    return null;
  }

  return LEGAL_DOCUMENT_TYPE_VALUES.includes(candidate as LegalDocumentType)
    ? (candidate as LegalDocumentType)
    : null;
}

function normalizeConsentType(value: unknown): LegalConsentType | null {
  const candidate = normalizeString(value);
  if (!candidate) {
    return null;
  }

  return LEGAL_CONSENT_TYPE_VALUES.includes(candidate as LegalConsentType)
    ? (candidate as LegalConsentType)
    : null;
}

function normalizeConsentStatus(value: unknown): LegalConsentStatus {
  const candidate = normalizeString(value);
  return LEGAL_CONSENT_STATUS_VALUES.includes(candidate as LegalConsentStatus)
    ? (candidate as LegalConsentStatus)
    : 'WITHDRAWN';
}

function normalizeSource(value: unknown): LegalAcceptanceSource | null {
  const candidate = normalizeString(value);
  if (!candidate) {
    return null;
  }

  const sources: LegalAcceptanceSource[] = ['SIGNUP', 'CHECKOUT', 'WIZARD', 'REPORT_DOWNLOAD', 'ADMIN', 'API'];
  return sources.includes(candidate as LegalAcceptanceSource) ? (candidate as LegalAcceptanceSource) : null;
}

function toDocument(record: Record<string, unknown>, fallbackType?: string): LegalDocumentVersion | null {
  const id =
    normalizeNullableString(record.id) ||
    normalizeNullableString(record.documentVersionId) ||
    normalizeNullableString(record.versionId);
  const documentType = normalizeDocumentType(record.documentType ?? record.type, fallbackType);

  if (!id || !documentType) {
    return null;
  }

  const title =
    normalizeNullableString(record.title) ||
    normalizeNullableString(record.name) ||
    LEGAL_DOCUMENT_TYPE_LABELS[documentType];

  return {
    id,
    documentType,
    title,
    versionLabel:
      normalizeNullableString(record.versionLabel) ||
      normalizeNullableString(record.versionName) ||
      normalizeNullableString(record.version),
    url:
      normalizeNullableString(record.url) ||
      normalizeNullableString(record.publicUrl) ||
      normalizeNullableString(record.documentUrl) ||
      normalizeNullableString(record.contentUrl),
    effectiveFrom:
      normalizeDate(record.effectiveFrom) ||
      normalizeDate(record.effectiveAt) ||
      normalizeDate(record.effectiveDate),
    publishedAt: normalizeDate(record.publishedAt) || normalizeDate(record.createdAt),
  };
}

function extractDocumentList(payload: unknown): LegalDocumentVersion[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => (isRecord(item) ? toDocument(item) : null))
      .filter((item): item is LegalDocumentVersion => Boolean(item));
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.documents)) {
    return payload.documents
      .map((item) => (isRecord(item) ? toDocument(item) : null))
      .filter((item): item is LegalDocumentVersion => Boolean(item));
  }

  if (Array.isArray(payload.items)) {
    return payload.items
      .map((item) => (isRecord(item) ? toDocument(item) : null))
      .filter((item): item is LegalDocumentVersion => Boolean(item));
  }

  return Object.entries(payload)
    .map(([key, value]) => (isRecord(value) ? toDocument(value, key) : null))
    .filter((item): item is LegalDocumentVersion => Boolean(item));
}

function toConsentRecord(record: Record<string, unknown>, fallbackStatus?: LegalConsentStatus): LegalConsentRecord | null {
  const consentType = normalizeConsentType(record.consentType ?? record.type);
  if (!consentType) {
    return null;
  }

  return {
    consentType,
    status: fallbackStatus ?? normalizeConsentStatus(record.status),
    source: normalizeSource(record.source),
    campaignId: normalizeNullableString(record.campaignId),
    updatedAt:
      normalizeDate(record.updatedAt) ||
      normalizeDate(record.effectiveAt) ||
      normalizeDate(record.createdAt),
    metadata: isRecord(record.metadata) ? record.metadata : null,
  };
}

function extractConsents(payload: unknown): LegalConsentRecord[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => (isRecord(item) ? toConsentRecord(item) : null))
      .filter((item): item is LegalConsentRecord => Boolean(item));
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.consents)) {
    return payload.consents
      .map((item) => (isRecord(item) ? toConsentRecord(item) : null))
      .filter((item): item is LegalConsentRecord => Boolean(item));
  }

  if (Array.isArray(payload.items)) {
    return payload.items
      .map((item) => (isRecord(item) ? toConsentRecord(item) : null))
      .filter((item): item is LegalConsentRecord => Boolean(item));
  }

  const one = toConsentRecord(payload);
  return one ? [one] : [];
}

function mapAcceptResult(payload: unknown, request: LegalAcceptDocumentsPayload): LegalAcceptDocumentsResult {
  const record = isRecord(payload) ? payload : {};

  const acceptedDocumentVersionIds = Array.isArray(record.acceptedDocumentVersionIds)
    ? record.acceptedDocumentVersionIds
        .map((item) => normalizeNullableString(item))
        .filter((item): item is string => Boolean(item))
    : request.documentVersionIds;

  return {
    acceptedDocumentVersionIds,
    source: normalizeSource(record.source) ?? request.source,
    orderId: normalizeNullableString(record.orderId) ?? request.orderId ?? null,
    acceptedAt:
      normalizeDate(record.acceptedAt) ||
      normalizeDate(record.createdAt) ||
      new Date().toISOString(),
  };
}

function mapMutationResult(
  payload: unknown,
  request: LegalConsentMutationPayload,
  status: LegalConsentStatus,
): LegalConsentRecord {
  const record = isRecord(payload) ? payload : {};
  const consent = toConsentRecord(record, status);

  if (consent) {
    return consent;
  }

  return {
    consentType: request.consentType,
    status,
    source: request.source,
    campaignId: request.campaignId ?? null,
    updatedAt: new Date().toISOString(),
    metadata: (request.metadata as Record<string, unknown>) ?? null,
  };
}

export const legalRealAdapter = {
  async getActiveDocuments(): Promise<LegalDocumentVersion[]> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/documents/active');
    const payload = unwrapData(response);
    return extractDocumentList(payload);
  },

  async acceptDocuments(payload: LegalAcceptDocumentsPayload): Promise<LegalAcceptDocumentsResult> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/documents/accept', {
      method: 'POST',
      body: payload,
    });
    return mapAcceptResult(unwrapData(response), payload);
  },

  async giveConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/consents/give', {
      method: 'POST',
      body: payload,
    });
    return mapMutationResult(unwrapData(response), payload, 'GIVEN');
  },

  async withdrawConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/consents/withdraw', {
      method: 'POST',
      body: payload,
    });
    return mapMutationResult(unwrapData(response), payload, 'WITHDRAWN');
  },

  async getMyConsents(): Promise<LegalConsentRecord[]> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/consents/me');
    return extractConsents(unwrapData(response));
  },
};
