/**
 * @jest-environment node
 */
/** Unit tests for the POST /api/weekly-insights route handler. */

import { NextRequest } from 'next/server';

jest.mock('../lib/rateLimiter', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 4, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  RATE_LIMITS: { 'weekly-insights': { maxRequests: 5, windowMs: 60000 } },
}));

jest.mock('../lib/gemini', () => ({
  generateWeeklyInsights: jest.fn(),
}));

import { generateWeeklyInsights as mockGenerateInsights } from '../lib/gemini';
import { POST } from '../app/api/weekly-insights/route';
import { WeeklyInsight, FoodLogEntry, HabitLog, DailyGoals } from '../types';

const MOCK_INSIGHT: WeeklyInsight = {
  summary: 'Strong week overall.',
  highlights: ['Hit protein goals 5/7 days', 'Consistent breakfast logging'],
  improvements: ['Increase fiber intake', 'Reduce processed snacks'],
  actionableTip: 'Add a handful of nuts to your afternoon snack.',
  overallScore: 7,
};

const makeFoodEntry = (date: string): FoodLogEntry => ({
  id: `entry-${date}`,
  description: 'Chicken and rice',
  analysis: {
    name: 'Chicken and Rice',
    macros: { calories: 500, protein: 35, carbs: 60, fat: 10, fiber: 3 },
    healthScore: 8,
    tip: 'Good protein source.',
    servingSize: '1 plate',
    ingredients: ['chicken', 'rice'],
  },
  loggedAt: `${date}T12:00:00.000Z`,
  mealType: 'lunch',
});

const VALID_WEEKLY_LOGS: FoodLogEntry[] = [
  makeFoodEntry('2026-04-10'),
  makeFoodEntry('2026-04-11'),
  makeFoodEntry('2026-04-12'),
];

const VALID_HABIT_LOGS: HabitLog[] = [
  { date: '2026-04-10', completed: ['hydration', 'steps'] },
  { date: '2026-04-11', completed: ['hydration'] },
];

const VALID_GOALS: DailyGoals = {
  calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25,
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/weekly-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  (mockGenerateInsights as jest.Mock).mockResolvedValue(MOCK_INSIGHT);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/weekly-insights', () => {
  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/weekly-insights', {
      method: 'POST',
      body: 'bad',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when weeklyLogs is not an array', async () => {
    const req = makeRequest({ weeklyLogs: 'not-an-array', habitLogs: VALID_HABIT_LOGS, goals: VALID_GOALS });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/weeklyLogs/);
  });

  it('returns 400 when habitLogs entries are malformed', async () => {
    const req = makeRequest({
      weeklyLogs: VALID_WEEKLY_LOGS,
      habitLogs: [{ notDate: true }],
      goals: VALID_GOALS,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/habitLogs/);
  });

  it('returns 400 when goals is missing required fields', async () => {
    const req = makeRequest({
      weeklyLogs: VALID_WEEKLY_LOGS,
      habitLogs: VALID_HABIT_LOGS,
      goals: { calories: 2000 }, // missing protein, carbs, fat, fiber
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/goals/);
  });

  it('returns 200 with WeeklyInsight on valid request', async () => {
    const req = makeRequest({
      weeklyLogs: VALID_WEEKLY_LOGS,
      habitLogs: VALID_HABIT_LOGS,
      goals: VALID_GOALS,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data).toEqual(MOCK_INSIGHT);
  });

  it('accepts empty weeklyLogs array (user logged nothing this week)', async () => {
    const req = makeRequest({
      weeklyLogs: [],
      habitLogs: VALID_HABIT_LOGS,
      goals: VALID_GOALS,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 when generateWeeklyInsights throws', async () => {
    (mockGenerateInsights as jest.Mock).mockRejectedValue(new Error('API down'));
    const req = makeRequest({
      weeklyLogs: VALID_WEEKLY_LOGS,
      habitLogs: VALID_HABIT_LOGS,
      goals: VALID_GOALS,
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.data).toBeNull();
    expect(body.error).toBeTruthy();
  });

  it('response always has { data, error } shape', async () => {
    const req = makeRequest({
      weeklyLogs: VALID_WEEKLY_LOGS,
      habitLogs: VALID_HABIT_LOGS,
      goals: VALID_GOALS,
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('error');
  });
});
