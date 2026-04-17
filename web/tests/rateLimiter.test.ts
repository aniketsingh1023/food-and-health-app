/**
 * @jest-environment node
 */
/** Unit tests for the in-memory sliding-window rate limiter. */

import { checkRateLimit, getClientIp } from '../lib/rateLimiter';

// ─── checkRateLimit ────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  const config = { maxRequests: 3, windowMs: 60_000 };

  it('allows requests up to the limit', () => {
    const key = `test:ip-${Date.now()}-a`;
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
  });

  it('blocks the request that exceeds the limit', () => {
    const key = `test:ip-${Date.now()}-b`;
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('counts remaining accurately', () => {
    const key = `test:ip-${Date.now()}-c`;
    const first = checkRateLimit(key, config);
    expect(first.remaining).toBe(2); // 3 max, 1 used

    checkRateLimit(key, config);
    const third = checkRateLimit(key, config);
    expect(third.remaining).toBe(0); // all 3 used
  });

  it('uses separate buckets for different keys', () => {
    const keyA = `test:ip-${Date.now()}-d1`;
    const keyB = `test:ip-${Date.now()}-d2`;
    // Fill up keyA
    checkRateLimit(keyA, config);
    checkRateLimit(keyA, config);
    checkRateLimit(keyA, config);
    expect(checkRateLimit(keyA, config).allowed).toBe(false);
    // keyB is independent — should still be allowed
    expect(checkRateLimit(keyB, config).allowed).toBe(true);
  });

  it('allows requests again after the window expires', () => {
    jest.useFakeTimers();
    const key = `test:ip-${Date.now()}-e`;
    const shortConfig = { maxRequests: 1, windowMs: 1_000 };

    checkRateLimit(key, shortConfig);
    expect(checkRateLimit(key, shortConfig).allowed).toBe(false);

    // Advance time past the window
    jest.advanceTimersByTime(1_100);
    expect(checkRateLimit(key, shortConfig).allowed).toBe(true);

    jest.useRealTimers();
  });
});

// ─── getClientIp ──────────────────────────────────────────────────────────────

describe('getClientIp', () => {
  function makeReq(headers: Record<string, string>): Request {
    return new Request('http://localhost/test', { headers });
  }

  it('extracts IP from x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '203.0.113.5' });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('takes the first IP from a comma-separated x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1, 172.16.0.1' });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('returns "unknown" when no IP header is present', () => {
    const req = makeReq({});
    expect(getClientIp(req)).toBe('unknown');
  });
});
