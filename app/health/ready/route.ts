import { getServerRuntimePublicConfig } from '@/shared/runtime-config/server';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const config = getServerRuntimePublicConfig();
    return Response.json(
      {
        status: 'ready',
        environment: config.APP_ENV,
        releaseId: config.RELEASE_ID,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch {
    return Response.json(
      { status: 'not_ready' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
