export function makeRequestId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for Node.js or older browsers
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
