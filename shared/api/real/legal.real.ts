import { ApiError, http } from '../index';
import type { ApiResponse } from '../types';
import {
  LEGAL_ACCEPTANCE_SOURCE_VALUES,
  LEGAL_CONSENT_STATUS_VALUES,
  type LegalAcceptDocumentsPayload,
  type LegalAcceptDocumentsResult,
  type LegalAcceptanceSource,
  type LegalConsentCatalogueItem,
  type LegalConsentContext,
  type LegalConsentMutationPayload,
  type LegalConsentRecord,
  type LegalConsentStatus,
  type LegalConsentType,
  type LegalDocumentType,
  type LegalDocumentVersion,
  type LegalDocumentWithContent,
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
  return /^[A-Z][A-Z0-9_]*$/.test(candidate) ? candidate : null;
}

function normalizeConsentType(value: unknown): LegalConsentType | null {
  const candidate = normalizeString(value);
  return /^[A-Z][A-Z0-9_]*$/.test(candidate) ? candidate : null;
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

  return (LEGAL_ACCEPTANCE_SOURCE_VALUES as readonly string[]).includes(candidate)
    ? (candidate as LegalAcceptanceSource)
    : null;
}

function normalizeSourceList(value: unknown): LegalAcceptanceSource[] {
  return Array.isArray(value)
    ? value.map(normalizeSource).filter((item): item is LegalAcceptanceSource => item !== null)
    : [];
}

function normalizeConsentContexts(value: unknown): LegalConsentContext[] {
  return Array.isArray(value)
    ? value.filter((item): item is LegalConsentContext => item === 'WIZARD' || item === 'ACCOUNT')
    : [];
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

  // The Backend names every document; a nameless one is not shown.
  const title = normalizeNullableString(record.title) || normalizeNullableString(record.name);
  if (!title) {
    return null;
  }

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
    contentHash: normalizeNullableString(record.contentHash),
    requiredAt: normalizeSourceList(record.requiredAt),
  };
}

function toDocumentWithContent(payload: unknown): LegalDocumentWithContent | null {
  if (!isRecord(payload)) return null;
  const document = toDocument(payload);
  const content = typeof payload.content === 'string' ? payload.content : null;
  return document && content ? { ...document, content } : null;
}

function toConsentCatalogueItem(record: Record<string, unknown>): LegalConsentCatalogueItem | null {
  const consentType = normalizeConsentType(record.consentType ?? record.type);
  const label = normalizeNullableString(record.label);
  if (!consentType || !label) return null;
  return {
    consentType,
    label,
    description: normalizeNullableString(record.description),
    requiredAt: normalizeConsentContexts(record.requiredAt),
    optionalAt: normalizeConsentContexts(record.optionalAt),
  };
}

function extractConsentCatalogue(payload: unknown): LegalConsentCatalogueItem[] {
  const items = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.items)
      ? payload.items
      : isRecord(payload) && Array.isArray(payload.consents)
        ? payload.consents
        : [];
  return items
    .map((item) => (isRecord(item) ? toConsentCatalogueItem(item) : null))
    .filter((item): item is LegalConsentCatalogueItem => item !== null);
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

async function fetchActiveDocuments(): Promise<LegalDocumentVersion[]> {
  const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/documents/active');
  return extractDocumentList(unwrapData(response));
}

/**
 * The same published policies, read without a session. Sign-up ticks them
 * before the account exists, so this route carries no credentials.
 */
async function fetchActivePublicDocuments(): Promise<LegalDocumentVersion[]> {
  const response = await http<ApiResponse<unknown> | unknown>(
    '/api/v2/legal/public/documents/active',
    { skipAuth: true },
  );
  return extractDocumentList(unwrapData(response));
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
    return fetchActiveDocuments();
  },

  async getActivePublicDocuments(): Promise<LegalDocumentVersion[]> {
    return fetchActivePublicDocuments();
  },

  /** The active policy published at a public path, with its text; null when none is. */
  async getPublicDocumentByPath(path: string): Promise<LegalDocumentWithContent | null> {
    try {
      const response = await http<ApiResponse<unknown> | unknown>(
        `/api/v2/legal/public/documents/by-path?path=${encodeURIComponent(path)}`,
        { skipAuth: true },
      );
      return toDocumentWithContent(unwrapData(response));
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'NotFound') return null;
      throw error;
    }
  },

  async getConsentCatalogue(): Promise<LegalConsentCatalogueItem[]> {
    const response = await http<ApiResponse<unknown> | unknown>(
      '/api/v2/legal/public/consents/catalogue',
      { skipAuth: true },
    );
    return extractConsentCatalogue(unwrapData(response));
  },

  async acceptDocuments(payload: LegalAcceptDocumentsPayload): Promise<LegalAcceptDocumentsResult> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/legal/documents/accept', {
      method: 'POST',
      body: payload,
    });
    return mapAcceptResult(unwrapData(response), payload);
  },

  async giveConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    // The privacy policy version is the server's to state: it stamps the one
    // live at that moment, so the record cannot be shaped by the browser.
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
