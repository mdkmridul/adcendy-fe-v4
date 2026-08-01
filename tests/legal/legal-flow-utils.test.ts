import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areAllRequiredDocumentsAccepted,
  areWizardRequiredConsentsSatisfied,
  buildCheckoutAcceptPayload,
  buildConsentToggleState,
  buildLegalChecklistItems,
  buildSignupAcceptPayload,
  getCheckoutRequiredDocumentIds,
  getSignupRequiredDocumentIds,
  resolveConsentPolicyVersion,
  resolveConsentAction,
  resolveConsentMutationEndpoint,
} from '../../shared/legal/legal-flow-utils.ts';
import type { LegalConsentRecord, LegalDocumentVersion } from '../../shared/types/legal.ts';
import { CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES, SIGNUP_REQUIRED_LEGAL_DOCUMENT_TYPES } from '../../shared/types/legal.ts';

const activeDocumentsFixture: LegalDocumentVersion[] = [
  {
    id: 'tos-v2',
    documentType: 'TERMS_OF_SERVICE',
    title: 'Terms',
    versionLabel: 'v2',
    url: 'https://example.com/tos',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'privacy-v2',
    documentType: 'PRIVACY_POLICY',
    title: 'Privacy',
    versionLabel: 'v2',
    url: 'https://example.com/privacy',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'refund-v2',
    documentType: 'REFUND_CANCELLATION_POLICY',
    title: 'Refund',
    versionLabel: 'v2',
    url: 'https://example.com/refund',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'disclaimer-v2',
    documentType: 'DISCLAIMER',
    title: 'Disclaimer',
    versionLabel: 'v2',
    url: 'https://example.com/disclaimer',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'delivery-v2',
    documentType: 'DIGITAL_DELIVERY_POLICY',
    title: 'Delivery',
    versionLabel: 'v2',
    url: 'https://example.com/delivery',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
];

test('1. active docs fetch + render model builds required signup checklist', () => {
  const checklist = buildLegalChecklistItems(activeDocumentsFixture, SIGNUP_REQUIRED_LEGAL_DOCUMENT_TYPES);
  assert.equal(checklist.length, 2);
  assert.equal(checklist[0]?.documentType, 'TERMS_OF_SERVICE');
  assert.equal(checklist[1]?.documentType, 'PRIVACY_POLICY');
  assert.ok(checklist.every((item) => item.href));
});

test('2. signup accept builds correct payload with SIGNUP source', () => {
  const signupIds = getSignupRequiredDocumentIds(activeDocumentsFixture);
  const payload = buildSignupAcceptPayload(signupIds);
  assert.deepEqual(payload, {
    documentVersionIds: ['tos-v2', 'privacy-v2'],
    source: 'SIGNUP',
  });
});

test('3. checkout requires all 5 required documents', () => {
  const checkoutIds = getCheckoutRequiredDocumentIds(activeDocumentsFixture);
  assert.equal(checkoutIds.length, CHECKOUT_REQUIRED_LEGAL_DOCUMENT_TYPES.length);
  assert.equal(
    areAllRequiredDocumentsAccepted(checkoutIds, ['tos-v2', 'privacy-v2', 'refund-v2', 'disclaimer-v2']),
    false,
  );
  assert.equal(
    areAllRequiredDocumentsAccepted(checkoutIds, checkoutIds),
    true,
  );
});

test('4. checkout accept payload includes orderId and CHECKOUT source', () => {
  const checkoutIds = getCheckoutRequiredDocumentIds(activeDocumentsFixture);
  const payload = buildCheckoutAcceptPayload(checkoutIds, 'order-123');
  assert.deepEqual(payload, {
    documentVersionIds: ['tos-v2', 'privacy-v2', 'refund-v2', 'disclaimer-v2', 'delivery-v2'],
    source: 'CHECKOUT',
    orderId: 'order-123',
  });
});

test('5. wizard requires PRIVACY_PROCESSING and AI_PROCESSING', () => {
  const state = buildConsentToggleState([]);
  assert.equal(areWizardRequiredConsentsSatisfied(state), false);

  const privacyOnly = { ...state, PRIVACY_PROCESSING: true };
  assert.equal(areWizardRequiredConsentsSatisfied(privacyOnly), false);

  const privacyAndAi = { ...state, PRIVACY_PROCESSING: true, AI_PROCESSING: true };
  assert.equal(areWizardRequiredConsentsSatisfied(privacyAndAi), true);
});

test('6. BENCHMARK_DATA remains optional for wizard requirement', () => {
  const requiredGivenBenchmarkOff = {
    ...buildConsentToggleState([]),
    PRIVACY_PROCESSING: true,
    AI_PROCESSING: true,
    BENCHMARK_DATA: false,
  };
  assert.equal(areWizardRequiredConsentsSatisfied(requiredGivenBenchmarkOff), true);
});

test('7. consent state hydrates from /consents/me style records', () => {
  const records: LegalConsentRecord[] = [
    {
      consentType: 'PRIVACY_PROCESSING',
      status: 'GIVEN',
      source: 'WIZARD',
      campaignId: 'camp-1',
      updatedAt: '2026-05-01T00:00:00.000Z',
      metadata: null,
    },
    {
      consentType: 'BENCHMARK_DATA',
      status: 'WITHDRAWN',
      source: 'WIZARD',
      campaignId: 'camp-1',
      updatedAt: '2026-05-01T00:00:00.000Z',
      metadata: null,
    },
  ];

  const state = buildConsentToggleState(records);
  assert.equal(state.PRIVACY_PROCESSING, true);
  assert.equal(state.BENCHMARK_DATA, false);
  assert.equal(state.AI_PROCESSING, false);
});

test('8. withdraw flow resolves to /consents/withdraw endpoint', () => {
  const action = resolveConsentAction(true, false);
  assert.equal(action, 'withdraw');
  assert.equal(resolveConsentMutationEndpoint(action), '/api/v2/legal/consents/withdraw');
});

test('9. consent mutations use the active privacy policy version', () => {
  assert.equal(resolveConsentPolicyVersion(activeDocumentsFixture), 'v2');
  assert.equal(
    resolveConsentPolicyVersion(
      activeDocumentsFixture.map((document) =>
        document.documentType === 'PRIVACY_POLICY'
          ? { ...document, versionLabel: null }
          : document,
      ),
    ),
    null,
  );
});
