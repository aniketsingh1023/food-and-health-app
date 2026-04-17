/**
 * @jest-environment node
 *
 * Unit tests for the /api/analyze-food route handler.
 * Uses Node environment so NextRequest's underlying Request global is available.
 */

import { NextRequest } from 'next/server';

// Mock the gemini module
jest.mock('../lib/gemini', () => ({
  analyzeFood: jest.fn(),
}));

// Mock rate limiter so tests are not capped
jest.mock('../lib/rateLimiter', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 29, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  RATE_LIMITS: { 'analyze-food': { maxRequests: 30, windowMs: 60000 } },
}));

import { analyzeFood as mockAnalyzeFood } from '../lib/gemini';
import { POST } from '../app/api/analyze-food/route';
import { FoodAnalysis } from '../types';

const MOCK_ANALYSIS: FoodAnalysis = {
  name: 'Avocado Toast',
  macros: { calories: 320, protein: 8, carbs: 35, fat: 18, fiber: 6 },
  healthScore: 8,
  tip: 'Healthy fats from avocado are great for heart health.',
  servingSize: '2 slices',
  ingredients: ['bread', 'avocado', 'salt', 'lemon'],
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze-food', () => {
  beforeEach(() => {
    (mockAnalyzeFood as jest.Mock).mockResolvedValue(MOCK_ANALYSIS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when description is missing', async () => {
    const req = makeRequest({ mealType: 'lunch' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(body.data).toBeNull();
  });

  it('returns 400 when description is empty string', async () => {
    const req = makeRequest({ description: '  ', mealType: 'lunch' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when mealType is invalid', async () => {
    const req = makeRequest({ description: 'pizza', mealType: 'elevenses' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/mealType/);
  });

  it('returns 400 when body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with FoodLogEntry shape on valid request', async () => {
    const req = makeRequest({ description: 'avocado toast', mealType: 'breakfast' });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeTruthy();
    expect(body.data.description).toBe('avocado toast');
    expect(body.data.mealType).toBe('breakfast');
    expect(body.data.loggedAt).toBeTruthy();
    expect(body.data.analysis).toEqual(MOCK_ANALYSIS);
  });

  it('returns consistent { data, error } shape on success', async () => {
    const req = makeRequest({ description: 'salad', mealType: 'lunch' });
    const res = await POST(req);
    const body = await res.json();

    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('error');
  });

  it('returns 500 when Gemini throws', async () => {
    (mockAnalyzeFood as jest.Mock).mockRejectedValue(new Error('Gemini unavailable'));
    const req = makeRequest({ description: 'pizza', mealType: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(body.data).toBeNull();
  });

  it('trims whitespace from description before analyzing', async () => {
    const req = makeRequest({ description: '  oatmeal  ', mealType: 'breakfast' });
    await POST(req);
    expect(mockAnalyzeFood).toHaveBeenCalledWith('oatmeal');
  });

  it('returns 400 when description exceeds 500 characters', async () => {
    const req = makeRequest({ description: 'a'.repeat(501), mealType: 'lunch' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/500/);
    expect(body.data).toBeNull();
  });

  it('accepts description of exactly 500 characters', async () => {
    const req = makeRequest({ description: 'a'.repeat(500), mealType: 'lunch' });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
