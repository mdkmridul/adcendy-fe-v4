export type ReplayableHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function shouldReplayAfterAuthRefresh(
  method: ReplayableHttpMethod,
  headers: Record<string, string>,
  allowAuthReplay = false,
): boolean {
  if (method === 'GET') return true;
  if (allowAuthReplay) return true;

  return Object.keys(headers).some(
    (name) =>
      name.toLowerCase() === 'idempotency-key' &&
      headers[name].trim().length > 0,
  );
}
