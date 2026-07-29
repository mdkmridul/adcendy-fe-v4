import assert from 'node:assert/strict';
import test from 'node:test';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test('keeps access credentials in memory and removes legacy persistence', async () => {
  const storage = new MemoryStorage();
  const fakeWindow = new EventTarget();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: fakeWindow,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });

  storage.setItem('adcendy_token', 'persisted-access-token');
  storage.setItem('adcendy_refresh_token', 'persisted-refresh-token');
  storage.setItem('adcendy_user', '{"role":"ADMIN"}');

  const auth = await import('../../features/auth/auth.ts');
  auth.clearLegacyAuthStorage();

  assert.equal(storage.getItem('adcendy_token'), null);
  assert.equal(storage.getItem('adcendy_refresh_token'), null);
  assert.equal(storage.getItem('adcendy_user'), null);
  assert.equal('getRefreshToken' in auth, false);
  assert.equal('setRefreshToken' in auth, false);

  auth.setAuthSession({
    accessToken: 'memory-only-access-token',
    user: {
      id: 'reviewer-1',
      email: 'reviewer@example.com',
      role: 'REVIEWER',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  });

  assert.equal(auth.getToken(), 'memory-only-access-token');
  assert.equal(auth.getUser()?.id, 'reviewer-1');
  assert.equal(storage.getItem('adcendy_token'), null);
  assert.equal(storage.getItem('adcendy_refresh_token'), null);

  auth.clearAuth({ broadcast: false });
  assert.equal(auth.getToken(), null);
  assert.equal(auth.getUser(), null);

  Reflect.deleteProperty(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'localStorage');
});
