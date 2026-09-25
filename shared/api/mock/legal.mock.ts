import { ApiError } from '../errors';
import type {
  LegalAcceptDocumentsPayload,
  LegalAcceptDocumentsResult,
  LegalConsentCatalogueItem,
  LegalConsentMutationPayload,
  LegalConsentRecord,
  LegalConsentType,
  LegalDocumentVersion,
  LegalDocumentWithContent,
} from '../../types/legal';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Local mock fixtures shaped like the Backend's public legal responses.
const mockActiveDocuments: LegalDocumentVersion[] = [
  {
    id: 'legal-terms-v2',
    documentType: 'TERMS_OF_SERVICE',
    title: 'Terms of Service',
    versionLabel: '2026-01-01',
    url: '/terms',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    contentHash: null,
    requiredAt: ['SIGNUP', 'CHECKOUT'],
  },
  {
    id: 'legal-privacy-v2',
    documentType: 'PRIVACY_POLICY',
    title: 'Privacy Policy',
    versionLabel: '2026-01-01',
    url: '/privacy-policy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    contentHash: null,
    requiredAt: ['SIGNUP', 'CHECKOUT'],
  },
  {
    id: 'legal-refund-v2',
    documentType: 'REFUND_CANCELLATION_POLICY',
    title: 'Refund & Cancellation Policy',
    versionLabel: '2026-01-01',
    url: '/refund-policy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    contentHash: null,
    requiredAt: ['CHECKOUT'],
  },
  {
    id: 'legal-disclaimer-v2',
    documentType: 'DISCLAIMER',
    title: 'Disclaimer',
    versionLabel: '2026-01-01',
    url: '/disclaimer',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    contentHash: null,
    requiredAt: ['CHECKOUT'],
  },
  {
    id: 'legal-delivery-v2',
    documentType: 'DIGITAL_DELIVERY_POLICY',
    title: 'Digital Delivery Policy',
    versionLabel: '2026-01-01',
    url: '/delivery-policy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    contentHash: null,
    requiredAt: ['CHECKOUT'],
  },
];

const mockConsentCatalogue: LegalConsentCatalogueItem[] = [
  { consentType: 'PRIVACY_PROCESSING', label: 'Privacy Processing', description: null, requiredAt: ['WIZARD'], optionalAt: [] },
  { consentType: 'AI_PROCESSING', label: 'AI Processing', description: null, requiredAt: ['WIZARD'], optionalAt: [] },
  { consentType: 'BENCHMARK_DATA', label: 'Benchmark Data', description: null, requiredAt: [], optionalAt: ['WIZARD', 'ACCOUNT'] },
  { consentType: 'MARKETING_EMAILS', label: 'Marketing Emails', description: null, requiredAt: [], optionalAt: ['ACCOUNT'] },
  { consentType: 'ADS_INTEGRATION', label: 'Ads Integration', description: null, requiredAt: [], optionalAt: ['ACCOUNT'] },
];

const consentState = new Map<LegalConsentType, LegalConsentRecord>();

function ensureConsentState() {
  for (const { consentType } of mockConsentCatalogue) {
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

  async getActivePublicDocuments(): Promise<LegalDocumentVersion[]> {
    await delay(80);
    return mockActiveDocuments;
  },

  async getPublicDocumentByPath(path: string): Promise<LegalDocumentWithContent | null> {
    await delay(80);
    const document = mockActiveDocuments.find((item) => item.url === path);
    return document
      ? { ...document, content: `*Effective date: 1 January 2026*

Mock ${document.title} text. The real text is served by the Backend.
` }
      : null;
  },

  async getConsentCatalogue(): Promise<LegalConsentCatalogueItem[]> {
    await delay(60);
    return mockConsentCatalogue;
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
    return mockConsentCatalogue.map(({ consentType }) => consentState.get(consentType) as LegalConsentRecord);
  },
};
