import type {
  LegalAcceptDocumentsPayload,
  LegalAcceptanceSource,
  LegalConsentRecord,
  LegalConsentType,
  LegalDocumentType,
  LegalDocumentVersion,
} from '../types/legal.ts';
import {
  CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES,
  LEGAL_CONSENT_TYPE_VALUES,
  LEGAL_CONSENT_TYPE_LABELS,
  LEGAL_DOCUMENT_TYPE_LABELS,
  SIGNUP_REQUIRED_LEGAL_DOCUMENT_TYPES,
  WIZARD_REQUIRED_CONSENT_TYPES,
} from '../types/legal.ts';

export type ConsentToggleState = Record<LegalConsentType, boolean>;

export type ConsentAction = 'give' | 'withdraw' | 'none';

export interface LegalChecklistItem {
  id: string;
  documentType: LegalDocumentType;
  label: string;
  href: string | null;
  required: boolean;
}

export function buildDocumentTypeIndex(
  documents: LegalDocumentVersion[],
): Partial<Record<LegalDocumentType, LegalDocumentVersion>> {
  return documents.reduce<Partial<Record<LegalDocumentType, LegalDocumentVersion>>>(
    (acc, document) => {
      if (!acc[document.documentType]) {
        acc[document.documentType] = document;
      }
      return acc;
    },
    {},
  );
}

export function buildLegalChecklistItems(
  documents: LegalDocumentVersion[],
  requiredDocumentTypes: readonly LegalDocumentType[],
): LegalChecklistItem[] {
  const requiredSet = new Set(requiredDocumentTypes);

  return documents
    .filter((document) => requiredSet.has(document.documentType))
    .map((document) => ({
      id: document.id,
      documentType: document.documentType,
      label: LEGAL_DOCUMENT_TYPE_LABELS[document.documentType] ?? document.title,
      href: document.url,
      required: true,
    }));
}

export function getRequiredDocumentIds(
  documents: LegalDocumentVersion[],
  requiredDocumentTypes: readonly LegalDocumentType[],
): string[] {
  const byType = buildDocumentTypeIndex(documents);

  return requiredDocumentTypes
    .map((documentType) => byType[documentType]?.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export function areAllRequiredDocumentsAccepted(
  requiredDocumentIds: string[],
  acceptedDocumentIds: string[],
): boolean {
  if (!requiredDocumentIds.length) {
    return false;
  }

  const acceptedSet = new Set(acceptedDocumentIds);
  return requiredDocumentIds.every((id) => acceptedSet.has(id));
}

export function buildSignupAcceptPayload(documentVersionIds: string[]): LegalAcceptDocumentsPayload {
  return {
    documentVersionIds,
    source: 'SIGNUP',
  };
}

export function buildCheckoutAcceptPayload(
  documentVersionIds: string[],
  orderId: string,
): LegalAcceptDocumentsPayload {
  return {
    documentVersionIds,
    source: 'CHECKOUT',
    orderId,
  };
}

export function buildConsentToggleState(
  records: LegalConsentRecord[],
): ConsentToggleState {
  const baseState = LEGAL_CONSENT_TYPE_VALUES.reduce<Partial<ConsentToggleState>>((acc, consentType) => {
    acc[consentType] = false;
    return acc;
  }, {});

  records.forEach((record) => {
    baseState[record.consentType] = record.status === 'GIVEN';
  });

  return baseState as ConsentToggleState;
}

export function areWizardRequiredConsentsSatisfied(
  state: ConsentToggleState,
): boolean {
  return WIZARD_REQUIRED_CONSENT_TYPES.every((consentType) => state[consentType]);
}

export function resolveConsentAction(
  previousChecked: boolean,
  nextChecked: boolean,
): ConsentAction {
  if (previousChecked === nextChecked) {
    return 'none';
  }

  return nextChecked ? 'give' : 'withdraw';
}

export function resolveConsentMutationEndpoint(action: ConsentAction): string | null {
  if (action === 'give') {
    return '/api/v2/legal/consents/give';
  }

  if (action === 'withdraw') {
    return '/api/v2/legal/consents/withdraw';
  }

  return null;
}

export function buildConsentLabel(consentType: LegalConsentType): string {
  return LEGAL_CONSENT_TYPE_LABELS[consentType];
}

export function getSignupRequiredDocumentIds(
  documents: LegalDocumentVersion[],
): string[] {
  return getRequiredDocumentIds(documents, SIGNUP_REQUIRED_LEGAL_DOCUMENT_TYPES);
}

export function getCheckoutRequiredDocumentIds(
  documents: LegalDocumentVersion[],
): string[] {
  return getRequiredDocumentIds(documents, CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES);
}

export function resolveConsentPolicyVersion(
  documents: LegalDocumentVersion[],
): string | null {
  const privacyPolicy = buildDocumentTypeIndex(documents).PRIVACY_POLICY;
  const version = privacyPolicy?.versionLabel?.trim();
  return version || null;
}

export function buildConsentMutationSource(
  source: LegalAcceptanceSource,
): LegalAcceptanceSource {
  return source;
}
