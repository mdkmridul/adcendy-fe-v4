import 'server-only';
import { buildRuntimePublicConfig } from './schema';

export function getServerRuntimePublicConfig() {
  return buildRuntimePublicConfig(process.env);
}
