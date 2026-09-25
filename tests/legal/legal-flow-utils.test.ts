import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  areAllRequiredDocumentsAccepted,
  areWizardRequiredConsentsSatisfied,
  buildCheckoutAcceptPayload,
  buildConsentLabel,
  buildConsentToggleState,
  buildLegalChecklistItems,
  buildSignupAcceptPayload,
  getCheckoutRequiredDocumentIds,
  getConsentsForContext,
  getSignupRequiredDocumentIds,
  resolveConsentAction,
  resolveConsentMutationEndpoint,
} from '../../shared/legal/legal-flow-utils.ts';
import * as legalFlowUtils from '../../shared/legal/legal-flow-utils.ts';
import type {
  LegalAcceptanceSource,
  LegalConsentCatalogueItem,
  LegalConsentRecord,
  LegalDocumentVersion,
} from '../../shared/types/legal.ts';

// Shaped like GET /api/v2/legal/public/documents/active: the Backend states
// which flow requires which document.
function doc(id: string, documentType: string, title: string, requiredAt: LegalAcceptanceSource[]): LegalDocumentVersion {
  return {
    id,
    documentType,
    title,
    versionLabel: '2026-01-01',
    url: `/${id}`,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    contentHash: 'hash',
    requiredAt,
  };
}

const activeDocumentsFixture: LegalDocumentVersion[] = [
  doc('tos-v2', 'TERMS_OF_SERVICE', 'Terms of Service', ['SIGNUP', 'CHECKOUT']),
  doc('privacy-v2', 'PRIVACY_POLICY', 'Privacy Policy', ['SIGNUP', 'CHECKOUT']),
  doc('refund-v2', 'REFUND_CANCELLATION_POLICY', 'Refund Policy', ['CHECKOUT']),
  doc('disclaimer-v2', 'DISCLAIMER', 'Disclaimer', ['CHECKOUT']),
  doc('delivery-v2', 'DIGITAL_DELIVERY_POLICY', 'Delivery Policy', ['CHECKOUT']),
  doc('cookies-v1', 'COOKIE_POLICY', 'Cookie Policy', []),
];

// Shaped like GET /api/v2/legal/public/consents/catalogue.
const catalogueFixture: LegalConsentCatalogueItem[] = [
  { consentType: 'PRIVACY_PROCESSING', label: 'Privacy Processing', description: null, requiredAt: ['WIZARD'], optionalAt: [] },
  { consentType: 'AI_PROCESSING', label: 'AI Processing', description: null, requiredAt: ['WIZARD'], optionalAt: [] },
  { consentType: 'BENCHMARK_DATA', label: 'Benchmark Data', description: null, requiredAt: [], optionalAt: ['WIZARD', 'ACCOUNT'] },
  { consentType: 'MARKETING_EMAILS', label: 'Marketing Emails', description: null, requiredAt: [], optionalAt: ['ACCOUNT'] },
];

test('1. the signup checklist is exactly what the Backend marks required at SIGNUP, labelled by its titles', () => {
  const checklist = buildLegalChecklistItems(activeDocumentsFixture, 'SIGNUP');
  assert.deepEqual(checklist.map((item) => item.documentType), ['TERMS_OF_SERVICE', 'PRIVACY_POLICY']);
  assert.deepEqual(checklist.map((item) => item.label), ['Terms of Service', 'Privacy Policy']);
  assert.ok(checklist.every((item) => item.href));
});

test('2. signup accept builds correct payload with SIGNUP source', () => {
  const payload = buildSignupAcceptPayload(getSignupRequiredDocumentIds(activeDocumentsFixture));
  assert.deepEqual(payload, { documentVersionIds: ['tos-v2', 'privacy-v2'], source: 'SIGNUP' });
});

test('3. checkout requires every document the Backend marks required at CHECKOUT', () => {
  const checkoutIds = getCheckoutRequiredDocumentIds(activeDocumentsFixture);
  assert.deepEqual(checkoutIds, ['tos-v2', 'privacy-v2', 'refund-v2', 'disclaimer-v2', 'delivery-v2']);
  assert.equal(areAllRequiredDocumentsAccepted(checkoutIds, checkoutIds.slice(0, 4)), false);
  assert.equal(areAllRequiredDocumentsAccepted(checkoutIds, checkoutIds), true);
});

test('4. a document the Backend adds to a flow is required with no Frontend change', () => {
  const withCookies = activeDocumentsFixture.map((document) =>
    document.documentType === 'COOKIE_POLICY' ? { ...document, requiredAt: ['SIGNUP' as const] } : document,
  );
  assert.deepEqual(getSignupRequiredDocumentIds(withCookies), ['tos-v2', 'privacy-v2', 'cookies-v1']);
});

test('5. nothing listed means nothing can be accepted', () => {
  assert.deepEqual(getCheckoutRequiredDocumentIds([]), []);
  assert.equal(areAllRequiredDocumentsAccepted([], []), false);
});

test('6. checkout accept payload includes orderId and CHECKOUT source', () => {
  const payload = buildCheckoutAcceptPayload(getCheckoutRequiredDocumentIds(activeDocumentsFixture), 'order-123');
  assert.equal(payload.source, 'CHECKOUT');
  assert.equal(payload.orderId, 'order-123');
});

test('7. wizard consents: the catalogue decides which are required', () => {
  const state = buildConsentToggleState([], catalogueFixture);
  assert.equal(areWizardRequiredConsentsSatisfied(state, catalogueFixture), false);
  assert.equal(areWizardRequiredConsentsSatisfied({ ...state, PRIVACY_PROCESSING: true }, catalogueFixture), false);
  assert.equal(
    areWizardRequiredConsentsSatisfied({ ...state, PRIVACY_PROCESSING: true, AI_PROCESSING: true }, catalogueFixture),
    true,
  );
});

test('8. an unloaded catalogue never counts as consent given', () => {
  assert.equal(areWizardRequiredConsentsSatisfied({ PRIVACY_PROCESSING: true, AI_PROCESSING: true }, []), false);
});

test('9. consents per context: required first, then optional, with Backend labels', () => {
  assert.deepEqual(
    getConsentsForContext(catalogueFixture, 'WIZARD').map((item) => [item.consentType, item.required]),
    [['PRIVACY_PROCESSING', true], ['AI_PROCESSING', true], ['BENCHMARK_DATA', false]],
  );
  assert.deepEqual(
    getConsentsForContext(catalogueFixture, 'ACCOUNT').map((item) => item.consentType),
    ['BENCHMARK_DATA', 'MARKETING_EMAILS'],
  );
  assert.equal(buildConsentLabel('AI_PROCESSING', catalogueFixture), 'AI Processing');
});

test('10. consent state hydrates from /consents/me style records', () => {
  const records: LegalConsentRecord[] = [
    { consentType: 'PRIVACY_PROCESSING', status: 'GIVEN', source: 'WIZARD', campaignId: 'camp-1', updatedAt: null, metadata: null },
    { consentType: 'BENCHMARK_DATA', status: 'WITHDRAWN', source: 'WIZARD', campaignId: 'camp-1', updatedAt: null, metadata: null },
  ];
  const state = buildConsentToggleState(records, catalogueFixture);
  assert.equal(state.PRIVACY_PROCESSING, true);
  assert.equal(state.BENCHMARK_DATA, false);
  assert.equal(state.AI_PROCESSING, false);
});

test('11. withdraw flow resolves to /consents/withdraw endpoint', () => {
  const action = resolveConsentAction(true, false);
  assert.equal(action, 'withdraw');
  assert.equal(resolveConsentMutationEndpoint(action), '/api/v2/legal/consents/withdraw');
});

test('12. the server states the consent policy version, not the browser', () => {
  assert.equal(typeof (legalFlowUtils as Record<string, unknown>).resolveConsentPolicyVersion, 'undefined');
});

test('13. the Frontend keeps no policy text, required-document list or consent list', () => {
  const types = readFileSync('shared/types/legal.ts', 'utf8');
  for (const retired of [
    'SIGNUP_REQUIRED_LEGAL_DOCUMENT_TYPES',
    'CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES',
    'WIZARD_REQUIRED_CONSENT_TYPES',
    'LEGAL_DOCUMENT_TYPE_LABELS',
    'LEGAL_CONSENT_TYPE_LABELS',
    'LEGAL_DOCUMENT_TYPE_VALUES',
    'LEGAL_CONSENT_TYPE_VALUES',
  ]) {
    assert.doesNotMatch(types, new RegExp(retired), retired);
  }
});
