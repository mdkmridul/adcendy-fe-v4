import {
  getServerRuntimePublicConfig,
} from '@/shared/runtime-config/server';
import { serializeRuntimeConfigScript } from '@/shared/runtime-config/schema';

export const dynamic = 'force-dynamic';

export function GET() {
  const script = serializeRuntimeConfigScript(
    getServerRuntimePublicConfig(),
  );
  return new Response(script, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
