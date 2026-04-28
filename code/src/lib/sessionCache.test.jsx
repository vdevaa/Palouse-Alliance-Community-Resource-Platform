import { describe, it, expect, beforeEach } from 'vitest';
import {
  readSessionCache,
  writeSessionCache,
  removeSessionCache,
  isSessionCacheFresh,
  getSessionCacheValue,
} from './sessionCache';

describe('sessionCache utilities', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('writes and reads cached values correctly', () => {
    writeSessionCache('test-key', { value: 42 });
    const entry = readSessionCache('test-key');

    expect(entry).toBeTruthy();
    expect(getSessionCacheValue(entry)).toEqual({ value: 42 });
  });

  it('returns null for malformed JSON data', () => {
    sessionStorage.setItem('bad-key', 'not-json');
    expect(readSessionCache('bad-key')).toBeNull();
  });

  it('removes keys from session storage', () => {
    writeSessionCache('delete-key', { anything: true });
    removeSessionCache('delete-key');
    expect(sessionStorage.getItem('delete-key')).toBeNull();
  });

  it('validates freshness correctly', () => {
    const now = Date.now();

    expect(isSessionCacheFresh(null, 1000)).toBe(false);
    expect(isSessionCacheFresh({ storedAt: 'bad' }, 1000)).toBe(false);
    expect(isSessionCacheFresh({ storedAt: now }, 0)).toBe(true);
    expect(isSessionCacheFresh({ storedAt: now - 5000 }, 1000)).toBe(false);
  });
});