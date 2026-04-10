/**
 * POST /api/weekly-insights
 * Generates a Gemini-powered weekly health summary.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyInsights } from '@/lib/gemini';
import { WeeklyInsightsRequest, WeeklyInsight, ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<WeeklyInsight>>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { weeklyLogs, habitLogs, goals } = body as Partial<WeeklyInsightsRequest>;

  if (!weeklyLogs || !habitLogs || !goals) {
    return NextResponse.json(
      { data: null, error: 'weeklyLogs, habitLogs, and goals are required' },
      { status: 400 },
    );
  }

  try {
    const insights = await generateWeeklyInsights(weeklyLogs, habitLogs, goals);
    return NextResponse.json({ data: insights, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate weekly insights';
    console.error('[weekly-insights]', message);
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
