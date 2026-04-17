/**
 * @jest-environment node
 */
/** Unit tests for the POST /api/chat route handler. */

import { NextRequest } from 'next/server';

// Mock rate limiter so tests are not capped
jest.mock('../lib/rateLimiter', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 19, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  RATE_LIMITS: { chat: { maxRequests: 20, windowMs: 60000 } },
}));

// Mock fetch to avoid real Gemini calls
global.fetch = jest.fn();

import { POST } from '../app/api/chat/route';

const VALID_CONTEXT = {
  consumed: { calories: 800, protein: 40, carbs: 100, fat: 20, fiber: 8 },
  goals:    { calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 },
  recentMeals: ['oatmeal', 'grilled chicken'],
};

const VALID_MESSAGES = [
  { id: '1', role: 'user', content: 'What should I eat for lunch?', createdAt: new Date().toISOString() },
];

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  (global.fetch as jest.Mock).mockReset();
});

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
  jest.clearAllMocks();
});

describe('POST /api/chat', () => {
  it('returns 400 when body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(body.data).toBeNull();
  });

  it('returns 400 when messages is missing', async () => {
    const req = makeRequest({ context: VALID_CONTEXT });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/messages/);
  });

  it('returns 400 when messages is empty array', async () => {
    const req = makeRequest({ messages: [], context: VALID_CONTEXT });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when context is missing', async () => {
    const req = makeRequest({ messages: VALID_MESSAGES });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/context/);
  });

  it('returns 400 when context.consumed is missing numeric fields', async () => {
    const req = makeRequest({
      messages: VALID_MESSAGES,
      context: { ...VALID_CONTEXT, consumed: { calories: 'bad' } },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when last user message exceeds 1000 chars', async () => {
    const longMessage = 'a'.repeat(1001);
    const req = makeRequest({
      messages: [{ id: '1', role: 'user', content: longMessage, createdAt: new Date().toISOString() }],
      context: VALID_CONTEXT,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/1000/);
  });

  it('returns 500 when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;
    const req = makeRequest({ messages: VALID_MESSAGES, context: VALID_CONTEXT });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.data).toBeNull();
    expect(body.error).toBeTruthy();
  });

  it('returns a streaming text response on success', async () => {
    // Mock a minimal SSE stream response from Gemini
    const sseChunk = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Try a salad!' }] } }] })}\n\n`;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(encoder.encode(sseChunk));
        ctrl.close();
      },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: stream,
    });

    const req = makeRequest({ messages: VALID_MESSAGES, context: VALID_CONTEXT });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
  });
});
