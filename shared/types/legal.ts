import type { ISODateTime } from './common';

/**
 * Policies and consents are the Backend's: which documents exist, their text,
 * which flow requires which document, which consents exist and which are
 * required all come from the API. The Frontend only names the flow it is in.
 */

/** A document type named by the Backend, e.g. TERMS_OF_SERVICE. */
export type LegalDocumentType = string;

/** A consent type named by the Backend, e.g. AI_PROCESSING. */
export type LegalConsentType = string;

export const LEGAL_ACCEPTANCE_SOURCE_VALUES = [
  'SIGNUP',
  'CHECKOUT',
  'WIZARD',
  'REPORT_DOWNLOAD',
  'ADMIN',
  'API',
] as const;

export type LegalAcceptanceSource = (typeof LEGAL_ACCEPTANCE_SOURCE_VALUES)[number];

/** Where a consent is asked for. */
export type LegalConsentContext = 'WIZARD' | 'ACCOUNT';

export const LEGAL_CONSENT_STATUS_VALUES = ['GIVEN', 'WITHDRAWN'] as const;
export type LegalConsentStatus = (typeof LEGAL_CONSENT_STATUS_VALUES)[number];

export interface LegalDocumentVersion {
  id: string;
  documentType: LegalDocumentType;
  title: string;
  versionLabel: string | null;
  /** The public page for this policy, e.g. /terms. */
  url: string | null;
  effectiveFrom: ISODateTime | null;
  publishedAt: ISODateTime | null;
  contentHash: string | null;
  /** The flows that require accepting this document. */
  requiredAt: LegalAcceptanceSource[];
}

export interface LegalDocumentWithContent extends LegalDocumentVersion {
  /** The published markdown text, exactly as accepted. */
  content: string;
}

export interface LegalConsentCatalogueItem {
  consentType: LegalConsentType;
  label: string;
  description: string | null;
  requiredAt: LegalConsentContext[];
  optionalAt: LegalConsentContext[];
}

export interface LegalAcceptDocumentsPayload {
  documentVersionIds: string[];
  source: LegalAcceptanceSource;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export interface LegalAcceptDocumentsResult {
  acceptedDocumentVersionIds: string[];
  source: LegalAcceptanceSource;
  orderId: string | null;
  acceptedAt: ISODateTime | null;
}

export interface LegalConsentMutationPayload {
  consentType: LegalConsentType;
  source: LegalAcceptanceSource;
  campaignId?: string;
  metadata?: Record<string, unknown>;
}

export interface LegalConsentRecord {
  consentType: LegalConsentType;
  status: LegalConsentStatus;
  source: LegalAcceptanceSource | null;
  campaignId: string | null;
  updatedAt: ISODateTime | null;
  metadata: Record<string, unknown> | null;
}
