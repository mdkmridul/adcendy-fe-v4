import type { AppEnvironment } from '@/shared/runtime-config/types';
import type { Role } from '@/shared/types/common';

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_CONCURRENT_UPLOADS = 1;

export const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
] as const;

export const ALLOWED_UPLOAD_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.csv',
  '.txt',
  '.md',
  '.jpg',
  '.jpeg',
  '.png',
] as const;

export type UploadValidationCode =
  | 'FILE_MISSING'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE';

export interface UploadCandidate {
  name: string;
  size: number;
  type: string;
}

export interface UploadValidationResult {
  valid: boolean;
  code?: UploadValidationCode;
  message?: string;
}

export function canUploadCampaignDocuments(
  role: Role | string | null | undefined,
): boolean {
  return role === 'ADMIN' || role === 'REVIEWER';
}

export function validateUploadCandidate(
  file: UploadCandidate | null | undefined,
): UploadValidationResult {
  if (!file || file.size <= 0) {
    return {
      valid: false,
      code: 'FILE_MISSING',
      message: 'Choose a non-empty file to upload.',
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: 'Files must be 25 MiB or smaller.',
    };
  }

  const extension = file.name.includes('.')
    ? `.${file.name.split('.').pop()?.toLowerCase()}`
    : '';
  const allowedMime = ALLOWED_UPLOAD_TYPES.includes(
    file.type.toLowerCase() as (typeof ALLOWED_UPLOAD_TYPES)[number],
  );
  const allowedExtension = ALLOWED_UPLOAD_EXTENSIONS.includes(
    extension as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number],
  );

  if ((!allowedMime && file.type.trim().length > 0) || !allowedExtension) {
    return {
      valid: false,
      code: 'UNSUPPORTED_FILE_TYPE',
      message:
        'Use PDF, Word, Excel, PowerPoint, CSV, text, Markdown, JPEG, or PNG.',
    };
  }

  return { valid: true };
}

export function validateAuthorizedDownloadUrl(
  value: string,
  appEnvironment: AppEnvironment,
): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('The download authorization returned an invalid URL.');
  }

  if (url.username || url.password) {
    throw new Error('The download URL cannot contain credentials.');
  }
  if (appEnvironment === 'local') {
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('The download URL uses an unsupported protocol.');
    }
  } else if (url.protocol !== 'https:') {
    throw new Error('Deployed downloads must use HTTPS.');
  }

  return url;
}

export function isExpiredOrNearExpiry(
  expiresAt: string,
  now = Date.now(),
  safetyWindowMs = 5_000,
): boolean {
  const expiry = Date.parse(expiresAt);
  return !Number.isFinite(expiry) || expiry <= now + safetyWindowMs;
}

export async function getFreshDownloadAuthorization<
  T extends { downloadUrl: string; expiresAt: string },
>(
  authorize: () => Promise<T>,
  options: {
    appEnvironment: AppEnvironment;
    now?: () => number;
  },
): Promise<{ authorization: T; url: URL }> {
  const now = options.now ?? Date.now;
  let authorization = await authorize();

  if (isExpiredOrNearExpiry(authorization.expiresAt, now())) {
    authorization = await authorize();
  }
  if (isExpiredOrNearExpiry(authorization.expiresAt, now())) {
    throw new Error('The download authorization expired before it could be used.');
  }

  return {
    authorization,
    url: validateAuthorizedDownloadUrl(
      authorization.downloadUrl,
      options.appEnvironment,
    ),
  };
}
