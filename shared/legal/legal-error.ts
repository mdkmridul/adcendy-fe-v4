import { ApiError } from '../api/errors';

const LEGAL_ERROR_MESSAGES: Record<string, string> = {
  STRATEGY_CONSENT_REQUIRED_V2:
    'Strategy generation requires Privacy Processing and AI Processing consent.',
  CHECKOUT_POLICIES_NOT_ACCEPTED_V2:
    'Please accept all checkout policies before continuing to payment.',
  UNKNOWN_LEGAL_DOCUMENT_VERSION_V2:
    'Some policy versions are outdated. Refresh and accept the latest versions.',
};

const KNOWN_LEGAL_ERROR_CODES = Object.keys(LEGAL_ERROR_MESSAGES);

function findCodeInValue(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const direct = KNOWN_LEGAL_ERROR_CODES.find((code) => value.includes(code));
    return direct ?? null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findCodeInValue(item);
      if (match) {
        return match;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const directKeys = ['code', 'errorCode', 'message', 'error'];
    for (const key of directKeys) {
      const match = findCodeInValue(record[key]);
      if (match) {
        return match;
      }
    }

    for (const nested of Object.values(record)) {
      const match = findCodeInValue(nested);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

export function extractLegalErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) {
    const fromDetails = findCodeInValue(error.details);
    if (fromDetails) {
      return fromDetails;
    }
    const fromData = findCodeInValue(error.data);
    if (fromData) {
      return fromData;
    }
    return findCodeInValue(error.message);
  }

  if (error instanceof Error) {
    return findCodeInValue(error.message);
  }

  return findCodeInValue(error);
}

export function resolveLegalErrorMessage(error: unknown, fallbackMessage: string): string {
  const code = extractLegalErrorCode(error);
  if (code && LEGAL_ERROR_MESSAGES[code]) {
    return LEGAL_ERROR_MESSAGES[code];
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function getLegalErrorMessageByCode(code: string): string | null {
  return LEGAL_ERROR_MESSAGES[code] ?? null;
}
