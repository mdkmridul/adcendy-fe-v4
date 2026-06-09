import type { ISODateTime } from './common';

export const LEGAL_DOCUMENT_TYPE_VALUES = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'REFUND_CANCELLATION_POLICY',
  'DISCLAIMER',
  'DIGITAL_DELIVERY_POLICY',
] as const;

export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPE_VALUES)[number];

export const LEGAL_ACCEPTANCE_SOURCE_VALUES = [
  'SIGNUP',
  'CHECKOUT',
  'WIZARD',
  'REPORT_DOWNLOAD',
  'ADMIN',
  'API',
] as const;

export type LegalAcceptanceSource = (typeof LEGAL_ACCEPTANCE_SOURCE_VALUES)[number];

export const LEGAL_CONSENT_TYPE_VALUES = [
  'PRIVACY_PROCESSING',
  'AI_PROCESSING',
  'BENCHMARK_DATA',
  'MARKETING_EMAILS',
  'ADS_INTEGRATION',
] as const;

export type LegalConsentType = (typeof LEGAL_CONSENT_TYPE_VALUES)[number];

export const LEGAL_CONSENT_STATUS_VALUES = ['GIVEN', 'WITHDRAWN'] as const;
export type LegalConsentStatus = (typeof LEGAL_CONSENT_STATUS_VALUES)[number];

export interface LegalDocumentVersion {
  id: string;
  documentType: LegalDocumentType;
  title: string;
  versionLabel: string | null;
  url: string | null;
  effectiveFrom: ISODateTime | null;
  publishedAt: ISODateTime | null;
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

export const SIGNUP_REQUIRED_LEGAL_DOCUMENT_TYPES: ReadonlyArray<LegalDocumentType> = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
];

export const CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES: ReadonlyArray<LegalDocumentType> = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'REFUND_CANCELLATION_POLICY',
  'DISCLAIMER',
  'DIGITAL_DELIVERY_POLICY',
];

export const WIZARD_REQUIRED_CONSENT_TYPES: ReadonlyArray<LegalConsentType> = [
  'PRIVACY_PROCESSING',
  'AI_PROCESSING',
];

export const WIZARD_OPTIONAL_CONSENT_TYPES: ReadonlyArray<LegalConsentType> = [
  'BENCHMARK_DATA',
];

export const ACCOUNT_OPTIONAL_CONSENT_TYPES: ReadonlyArray<LegalConsentType> = [
  'BENCHMARK_DATA',
  'MARKETING_EMAILS',
  'ADS_INTEGRATION',
];

export const LEGAL_DOCUMENT_TYPE_LABELS: Record<LegalDocumentType, string> = {
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
  REFUND_CANCELLATION_POLICY: 'Refund & Cancellation Policy',
  DISCLAIMER: 'Disclaimer',
  DIGITAL_DELIVERY_POLICY: 'Digital Delivery Policy',
};

export const LEGAL_CONSENT_TYPE_LABELS: Record<LegalConsentType, string> = {
  PRIVACY_PROCESSING: 'Privacy Processing',
  AI_PROCESSING: 'AI Processing',
  BENCHMARK_DATA: 'Benchmark Data',
  MARKETING_EMAILS: 'Marketing Emails',
  ADS_INTEGRATION: 'Ads Integration',
};

export function formatLegalDocumentType(value: LegalDocumentType): string {
  return LEGAL_DOCUMENT_TYPE_LABELS[value];
}

export function formatLegalConsentType(value: LegalConsentType): string {
  return LEGAL_CONSENT_TYPE_LABELS[value];
}
