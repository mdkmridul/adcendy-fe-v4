const MINIMUM_KEY_LENGTH = 16;

function fallbackUuid(): string {
  const random = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${random}-${random}`;
}

export function createIdempotencyKey(operation: string): string {
  const normalizedOperation = operation
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || 'mutation';
  const uuid =
    globalThis.crypto?.randomUUID?.() ??
    fallbackUuid();
  const key = `adcendy-${normalizedOperation}-${uuid}`;

  if (key.length < MINIMUM_KEY_LENGTH) {
    throw new Error('Generated idempotency key is too short.');
  }

  return key.slice(0, 128);
}
