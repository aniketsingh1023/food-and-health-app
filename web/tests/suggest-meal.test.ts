/**
 * @jest-environment node
 */
/** Unit tests for the POST /api/suggest-meal route handler. */

import { NextRequest } from 'next/server';

jest.mock('../lib/rateLimiter', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 19, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  RATE_LIMITS: { 'suggest-meal': { maxRequests: 20, windowMs: 60000 } },
}));

jest.mock('../lib/gemini', () => ({
  suggestMeal: jest.fn(),
}));

import { suggestMeal as mockSuggestMeal } from '../lib/gemini';
import { POST } from '../app/api/suggest-meal/route';
import { MealSuggestion } from '../types';

const MOCK_SUGGESTION: MealSuggestion = {
  name: 'Quinoa Bowl',
  description: 'A balanced grain bowl.',
  estimatedMacros: { calories: 400, protein: 18, carbs: 55, fat: 12, fiber: 7 },
  reason: 'Hits your remaining carb and protein goals.',
  prepTime: '15 mins',
};

const VALID_BODY = {
  consumed: { calories: 1000, protein: 40, carbs: 120, fat: 30, fiber: 10 },
  goals:    { calories: 2000, protein: 60, carbs: 250, fat: 65, fiber: 25 },
  timeOfDay: 'afternoon',
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/suggest-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  (mockSuggestMeal as jest.Mock).mockResolvedValue(MOCK_SUGGESTION);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/suggest-meal', () => {
  it('returns 400 when body is invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/suggest-meal', {
      method: 'POST',
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when consumed is missing', async () => {
    const req = makeRequest({ goals: VALID_BODY.goals, timeOfDay: 'morning' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/consumed/);
  });

  it('returns 400 when goals has non-numeric fields', async () => {
    const req = makeRequest({
      ...VALID_BODY,
      goals: { calories: 'lots', protein: 60, carbs: 250, fat: 65, fiber: 25 },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid timeOfDay', async () => {
    const req = makeRequest({ ...VALID_BODY, timeOfDay: 'midnight' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/timeOfDay/);
  });

  it('returns 400 when preferences exceeds 200 chars', async () => {
    const req = makeRequest({ ...VALID_BODY, preferences: 'v'.repeat(201) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/200/);
  });

  it('returns 400 when preferences is a non-string', async () => {
    const req = makeRequest({ ...VALID_BODY, preferences: 42 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with MealSuggestion on valid request', async () => {
    const req = makeRequest(VALID_BODY);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data).toEqual(MOCK_SUGGESTION);
  });

  it('passes preferences through when provided and valid', async () => {
    const req = makeRequest({ ...VALID_BODY, preferences: 'vegetarian' });
    await POST(req);
    expect(mockSuggestMeal).toHaveBeenCalledWith(
      VALID_BODY.consumed,
      VALID_BODY.goals,
      'afternoon',
      'vegetarian',
    );
  });

  it('returns 500 when suggestMeal throws', async () => {
    (mockSuggestMeal as jest.Mock).mockRejectedValue(new Error('Gemini down'));
    const req = makeRequest(VALID_BODY);
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.data).toBeNull();
    expect(body.error).toBeTruthy();
  });

  it('response always has { data, error } shape', async () => {
    const req = makeRequest(VALID_BODY);
    const res = await POST(req);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('error');
  });
});
