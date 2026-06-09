import { ApiError } from '../errors';
import {
  LEGAL_CONSENT_TYPE_VALUES,
  type LegalAcceptDocumentsPayload,
  type LegalAcceptDocumentsResult,
  type LegalConsentMutationPayload,
  type LegalConsentRecord,
  type LegalConsentType,
  type LegalDocumentVersion,
} from '../../types/legal';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockActiveDocuments: LegalDocumentVersion[] = [
  {
    id: 'legal-terms-v2',
    documentType: 'TERMS_OF_SERVICE',
    title: 'Terms of Service',
    versionLabel: 'v2',
    url: '/legal/terms-of-service',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'legal-privacy-v2',
    documentType: 'PRIVACY_POLICY',
    title: 'Privacy Policy',
    versionLabel: 'v2',
    url: '/legal/privacy-policy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'legal-refund-v2',
    documentType: 'REFUND_CANCELLATION_POLICY',
    title: 'Refund & Cancellation Policy',
    versionLabel: 'v2',
    url: '/legal/refund-cancellation-policy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'legal-disclaimer-v2',
    documentType: 'DISCLAIMER',
    title: 'Disclaimer',
    versionLabel: 'v2',
    url: '/legal/disclaimer',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'legal-delivery-v2',
    documentType: 'DIGITAL_DELIVERY_POLICY',
    title: 'Digital Delivery Policy',
    versionLabel: 'v2',
    url: '/legal/digital-delivery-policy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
];

const consentState = new Map<LegalConsentType, LegalConsentRecord>();

function ensureConsentState() {
  for (const consentType of LEGAL_CONSENT_TYPE_VALUES) {
    if (!consentState.has(consentType)) {
      consentState.set(consentType, {
        consentType,
        status: 'WITHDRAWN',
        source: null,
        campaignId: null,
        updatedAt: null,
        metadata: null,
      });
    }
  }
}

function validateDocumentVersionIds(documentVersionIds: string[]) {
  const knownIds = new Set(mockActiveDocuments.map((document) => document.id));
  const unknownId = documentVersionIds.find((id) => !knownIds.has(id));
  if (unknownId) {
    throw new ApiError({
      kind: 'Validation',
      status: 400,
      message: 'UNKNOWN_LEGAL_DOCUMENT_VERSION_V2',
      details: { code: 'UNKNOWN_LEGAL_DOCUMENT_VERSION_V2', unknownId },
    });
  }
}

function applyConsentMutation(
  payload: LegalConsentMutationPayload,
  status: LegalConsentRecord['status'],
): LegalConsentRecord {
  ensureConsentState();
  const nextRecord: LegalConsentRecord = {
    consentType: payload.consentType,
    status,
    source: payload.source,
    campaignId: payload.campaignId ?? null,
    updatedAt: new Date().toISOString(),
    metadata: (payload.metadata as Record<string, unknown>) ?? null,
  };
  consentState.set(payload.consentType, nextRecord);
  return nextRecord;
}

export const legalMockAdapter = {
  async getActiveDocuments(): Promise<LegalDocumentVersion[]> {
    await delay(80);
    return mockActiveDocuments;
  },

  async acceptDocuments(payload: LegalAcceptDocumentsPayload): Promise<LegalAcceptDocumentsResult> {
    await delay(100);
    validateDocumentVersionIds(payload.documentVersionIds);

    return {
      acceptedDocumentVersionIds: payload.documentVersionIds,
      source: payload.source,
      orderId: payload.orderId ?? null,
      acceptedAt: new Date().toISOString(),
    };
  },

  async giveConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    await delay(90);
    return applyConsentMutation(payload, 'GIVEN');
  },

  async withdrawConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    await delay(90);
    return applyConsentMutation(payload, 'WITHDRAWN');
  },

  async getMyConsents(): Promise<LegalConsentRecord[]> {
    await delay(80);
    ensureConsentState();
    return LEGAL_CONSENT_TYPE_VALUES.map((consentType) => consentState.get(consentType) as LegalConsentRecord);
  },
};
