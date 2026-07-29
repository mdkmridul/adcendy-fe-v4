import type { AuthUser } from './types';

const LEGACY_AUTH_STORAGE_KEYS = [
  'adcendy_token',
  'adcendy_refresh_token',
  'adcendy_user',
] as const;
const AUTH_SYNC_STORAGE_KEY = 'adcendy_auth_sync';
const AUTH_CHANNEL_NAME = 'adcendy_auth';

type AuthSyncMessage = 'session-established' | 'session-cleared';

let accessToken: string | null = null;
let currentUser: AuthUser | null = null;
let authChannel: BroadcastChannel | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function notifyAuthChange(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event('auth-change'));
  }
}

function publishAuthSync(message: AuthSyncMessage): void {
  if (!isBrowser()) return;

  try {
    if (authChannel) {
      authChannel.postMessage(message);
      return;
    }
  } catch {
    // Fall back to a credential-free storage signal below.
  }

  try {
    localStorage.setItem(
      AUTH_SYNC_STORAGE_KEY,
      JSON.stringify({ message, nonce: crypto.randomUUID() }),
    );
    localStorage.removeItem(AUTH_SYNC_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

/**
 * Remove credentials persisted by pre-Wave-1 Frontend releases.
 *
 * The active access token and authenticated user are held only in this
 * JavaScript module. The refresh token is owned exclusively by the Backend's
 * HttpOnly cookie and is never readable by Frontend code.
 */
export function clearLegacyAuthStorage(): void {
  if (!isBrowser()) return;

  try {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function getToken(): string | null {
  return isBrowser() ? accessToken : null;
}

export function setToken(token: string): void {
  if (!isBrowser()) return;
  accessToken = token;
  notifyAuthChange();
}

export function getUser(): AuthUser | null {
  return isBrowser() ? currentUser : null;
}

export function setUser(user: AuthUser): void {
  if (!isBrowser()) return;
  currentUser = user;
  notifyAuthChange();
}

export function clearAuth(options: { broadcast?: boolean } = {}): void {
  if (!isBrowser()) return;

  accessToken = null;
  currentUser = null;
  clearLegacyAuthStorage();
  notifyAuthChange();

  if (options.broadcast !== false) {
    publishAuthSync('session-cleared');
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() && getUser());
}

export function setAuth(
  token: string,
  user: AuthUser,
  options: { broadcast?: boolean } = {},
): void {
  setAuthSession({ accessToken: token, user }, options);
}

export function setAuthSession(
  session: { accessToken: string; user: AuthUser },
  options: { broadcast?: boolean } = {},
): void {
  if (!isBrowser()) return;

  clearLegacyAuthStorage();
  accessToken = session.accessToken;
  currentUser = session.user;
  notifyAuthChange();

  if (options.broadcast !== false) {
    publishAuthSync('session-established');
  }
}

/**
 * Connect the in-memory session to other tabs without sharing credentials.
 * Other tabs receive only a session hint and bootstrap independently through
 * the Backend's HttpOnly refresh cookie.
 */
export function initializeAuthSync(): () => void {
  if (!isBrowser()) return () => undefined;

  clearLegacyAuthStorage();

  const handleMessage = (message: AuthSyncMessage) => {
    if (message === 'session-cleared') {
      clearAuth({ broadcast: false });
      return;
    }

    window.dispatchEvent(new Event('auth-bootstrap-requested'));
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_SYNC_STORAGE_KEY || !event.newValue) return;

    try {
      const parsed = JSON.parse(event.newValue) as { message?: AuthSyncMessage };
      if (parsed.message) handleMessage(parsed.message);
    } catch {
      // Ignore malformed cross-tab hints.
    }
  };

  try {
    authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    authChannel.addEventListener('message', (event: MessageEvent<AuthSyncMessage>) => {
      handleMessage(event.data);
    });
  } catch {
    authChannel = null;
  }

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
    authChannel?.close();
    authChannel = null;
  };
}
