/**
 * @jest-environment node
 */
/** Unit tests for the GET /api/health route. */

import { GET } from '../app/api/health/route';

describe('GET /api/health', () => {
  it('returns 200', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it('returns { data: { status: "ok", timestamp }, error: null }', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('ok');
    expect(typeof body.data.timestamp).toBe('string');
  });

  it('timestamp is a valid ISO 8601 date string', async () => {
    const res = await GET();
    const { data } = await res.json();
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});
