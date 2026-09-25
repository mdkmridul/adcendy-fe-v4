import type {
  LegalAcceptDocumentsPayload,
  LegalAcceptanceSource,
  LegalConsentCatalogueItem,
  LegalConsentContext,
  LegalConsentRecord,
  LegalConsentType,
  LegalDocumentType,
  LegalDocumentVersion,
} from '../types/legal.ts';

/**
 * Every rule here is read from what the Backend returned: `requiredAt` on
 * each document, and the consent catalogue. Nothing is decided locally.
 */

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

/** The active documents the Backend requires at this flow, one per type. */
export function getRequiredDocuments(
  documents: LegalDocumentVersion[],
  source: LegalAcceptanceSource,
): LegalDocumentVersion[] {
  return Object.values(buildDocumentTypeIndex(documents)).filter(
    (document): document is LegalDocumentVersion =>
      Boolean(document) && document!.requiredAt.includes(source),
  );
}

export function buildLegalChecklistItems(
  documents: LegalDocumentVersion[],
  source: LegalAcceptanceSource,
): LegalChecklistItem[] {
  return getRequiredDocuments(documents, source).map((document) => ({
    id: document.id,
    documentType: document.documentType,
    label: document.title,
    href: document.url,
    required: true,
  }));
}

export function getRequiredDocumentIds(
  documents: LegalDocumentVersion[],
  source: LegalAcceptanceSource,
): string[] {
  return getRequiredDocuments(documents, source)
    .map((document) => document.id)
    .filter((id) => id.length > 0);
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
  catalogue: LegalConsentCatalogueItem[],
): ConsentToggleState {
  const state: ConsentToggleState = {};
  for (const item of catalogue) state[item.consentType] = false;
  for (const record of records) state[record.consentType] = record.status === 'GIVEN';
  return state;
}

/** Consents asked for in a context: required ones first, then optional, in catalogue order. */
export function getConsentsForContext(
  catalogue: LegalConsentCatalogueItem[],
  context: LegalConsentContext,
): Array<LegalConsentCatalogueItem & { required: boolean }> {
  const required = catalogue
    .filter((item) => item.requiredAt.includes(context))
    .map((item) => ({ ...item, required: true }));
  const optional = catalogue
    .filter((item) => !item.requiredAt.includes(context) && item.optionalAt.includes(context))
    .map((item) => ({ ...item, required: false }));
  return [...required, ...optional];
}

export function isConsentRequiredAt(
  catalogue: LegalConsentCatalogueItem[],
  consentType: LegalConsentType,
  context: LegalConsentContext,
): boolean {
  return catalogue.some((item) => item.consentType === consentType && item.requiredAt.includes(context));
}

/** False until the catalogue has loaded: an unknown requirement is never assumed met. */
export function areWizardRequiredConsentsSatisfied(
  state: ConsentToggleState,
  catalogue: LegalConsentCatalogueItem[],
): boolean {
  const required = catalogue.filter((item) => item.requiredAt.includes('WIZARD'));
  return catalogue.length > 0 && required.every((item) => state[item.consentType] === true);
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

export function buildConsentLabel(
  consentType: LegalConsentType,
  catalogue: LegalConsentCatalogueItem[],
): string {
  return catalogue.find((item) => item.consentType === consentType)?.label ?? consentType;
}

export function getSignupRequiredDocumentIds(
  documents: LegalDocumentVersion[],
): string[] {
  return getRequiredDocumentIds(documents, 'SIGNUP');
}

export function getCheckoutRequiredDocumentIds(
  documents: LegalDocumentVersion[],
): string[] {
  return getRequiredDocumentIds(documents, 'CHECKOUT');
}


export function buildConsentMutationSource(
  source: LegalAcceptanceSource,
): LegalAcceptanceSource {
  return source;
}
