import ENV from '@/lib/env';
import { legalMockAdapter } from '../mock/legal.mock';
import { legalRealAdapter } from '../real/legal.real';
import type {
  LegalAcceptDocumentsPayload,
  LegalAcceptDocumentsResult,
  LegalConsentMutationPayload,
  LegalConsentRecord,
  LegalDocumentVersion,
} from '@/shared/types/legal';

const adapter = ENV.API.isMock ? legalMockAdapter : legalRealAdapter;

if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Legal Repository] Using adapter:', ENV.API.dataSource);
}

export const legalRepository = {
  async getActiveDocuments(): Promise<LegalDocumentVersion[]> {
    return adapter.getActiveDocuments();
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
