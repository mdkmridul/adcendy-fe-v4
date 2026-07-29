const SENSITIVE_KEY_PATTERN =
  /(?:authorization|cookie|token|secret|password|signed[_-]?url|download[_-]?url|storage[_-]?key)/i;
const SENSITIVE_VALUE_PATTERN =
  /(?:bearer\s+[a-z0-9._~+/=-]+|https?:\/\/\S+[?&](?:x-amz-|x-goog-|signature|token)[^=\s]*=)/i;

export type AnalyticsPrimitive = string | number | boolean | null;

export function sanitizeAnalyticsPath(value: string): string {
  try {
    const url = new URL(value, 'https://analytics.invalid');
    return url.pathname;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

export function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>,
): Record<string, AnalyticsPrimitive> {
  const sanitized: Record<string, AnalyticsPrimitive> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      value !== null
    ) {
      continue;
    }
    if (typeof value === 'string' && SENSITIVE_VALUE_PATTERN.test(value)) {
      continue;
    }

    sanitized[key] =
      typeof value === 'string' && /(?:path|url|href|location)/i.test(key)
        ? sanitizeAnalyticsPath(value)
        : value;
  }

  return sanitized;
}
