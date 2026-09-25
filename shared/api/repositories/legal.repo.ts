import ENV, { createRuntimeRepositoryAdapter } from '@/lib/env';
import { legalMockAdapter } from '../mock/legal.mock';
import { legalRealAdapter } from '../real/legal.real';
import type {
  LegalAcceptDocumentsPayload,
  LegalAcceptDocumentsResult,
  LegalConsentCatalogueItem,
  LegalConsentMutationPayload,
  LegalConsentRecord,
  LegalDocumentVersion,
  LegalDocumentWithContent,
} from '@/shared/types/legal';

const adapter = createRuntimeRepositoryAdapter(legalMockAdapter, legalRealAdapter);

if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Legal Repository] Using adapter:', ENV.API.dataSource);
}

export const legalRepository = {
  async getActiveDocuments(): Promise<LegalDocumentVersion[]> {
    return adapter.getActiveDocuments();
  },

  /** For screens with no session yet, such as sign-up. */
  async getActivePublicDocuments(): Promise<LegalDocumentVersion[]> {
    return adapter.getActivePublicDocuments();
  },

  /** The policy published at a public path (e.g. /terms), with its text. */
  async getPublicDocumentByPath(path: string): Promise<LegalDocumentWithContent | null> {
    return adapter.getPublicDocumentByPath(path);
  },

  /** Which consents exist, their labels, and where each is required or optional. */
  async getConsentCatalogue(): Promise<LegalConsentCatalogueItem[]> {
    return adapter.getConsentCatalogue();
  },

  async acceptDocuments(payload: LegalAcceptDocumentsPayload): Promise<LegalAcceptDocumentsResult> {
    return adapter.acceptDocuments(payload);
  },

  async giveConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    return adapter.giveConsent(payload);
  },

  async withdrawConsent(payload: LegalConsentMutationPayload): Promise<LegalConsentRecord> {
    return adapter.withdrawConsent(payload);
  },

  async getMyConsents(): Promise<LegalConsentRecord[]> {
    return adapter.getMyConsents();
  },
};
