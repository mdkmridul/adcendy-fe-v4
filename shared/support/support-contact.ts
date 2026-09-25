import ENV from '@/lib/env';

export interface SupportContact {
  href: string;
  /** The address itself for email, otherwise a generic label. */
  label: string;
  isEmail: boolean;
}

/** The support destination from runtime config (SUPPORT_URL), or null when unset (local only). */
export function getSupportContact(): SupportContact | null {
  const url = ENV.public.supportUrl;
  if (!url) return null;
  if (url.startsWith('mailto:')) {
    return { href: url, label: url.slice('mailto:'.length), isEmail: true };
  }
  return { href: url, label: 'our support page', isEmail: false };
}
