/**
 * Gemini AI client with typed prompts and structured JSON output.
 * Uses gemini-1.5-flash for speed-critical paths, gemini-1.5-pro for analysis.
 */

import {
  FoodAnalysis,
  MealSuggestion,
  WeeklyInsight,
  Macros,
  DailyGoals,
  FoodLogEntry,
  HabitLog,
} from '@/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Simple in-memory cache for repeated food lookups */
const foodCache = new Map<string, FoodAnalysis>();

interface GeminiRequest {
  contents: Array<{ parts: Array<{ text: string }> }>;
  generationConfig: {
    responseMimeType: 'application/json';
    temperature?: number;
    maxOutputTokens?: number;
  };
  systemInstruction?: { parts: Array<{ text: string }> };
}

/**
 * Makes a typed request to the Gemini API.
 * Returns parsed JSON or throws a typed error.
 */
async function callGemini<T>(
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
  prompt: string,
  systemInstruction: string,
  fallback: T,
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const body: GeminiRequest = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  const res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const json = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// ─── Food Analysis ────────────────────────────────────────────────────────────

const FOOD_ANALYSIS_FALLBACK: FoodAnalysis = {
  name: 'Unknown Food',
  macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  healthScore: 5,
  tip: 'Try to include more whole foods in your diet.',
  servingSize: '1 serving',
  ingredients: [],
};

const FOOD_ANALYSIS_SYSTEM = `You are a certified nutritionist. Return ONLY valid JSON matching this shape:
{"name":string,"macros":{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number},"healthScore":number,"tip":string,"servingSize":string,"ingredients":string[]}
healthScore is 1-10. All macro values are numbers. tip is under 100 chars.`;

/**
 * Analyzes a food description and returns nutrition data via Gemini.
 * Results are cached by normalized description key.
 */
export async function analyzeFood(description: string): Promise<FoodAnalysis> {
  const cacheKey = description.toLowerCase().trim();
  const cached = foodCache.get(cacheKey);
  if (cached) return cached;

  const result = await callGemini<FoodAnalysis>(
    'gemini-2.5-flash',
    `Analyze this meal for nutrition: "${description}"`,
    FOOD_ANALYSIS_SYSTEM,
    FOOD_ANALYSIS_FALLBACK,
  );

  foodCache.set(cacheKey, result);
  return result;
}

// ─── Meal Suggestions ─────────────────────────────────────────────────────────

const MEAL_SUGGESTION_FALLBACK: MealSuggestion = {
  name: 'Grilled Chicken Salad',
  description: 'A light, protein-packed salad with mixed greens.',
  estimatedMacros: { calories: 350, protein: 35, carbs: 20, fat: 12, fiber: 5 },
  reason: 'Great for hitting your protein goals.',
  prepTime: '15 mins',
};

const MEAL_SUGGESTION_SYSTEM = `You are a meal planning assistant. Return ONLY valid JSON:
{"name":string,"description":string,"estimatedMacros":{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number},"reason":string,"prepTime":string}`;

/**
 * Suggests a meal based on remaining macros and time of day.
 */
export async function suggestMeal(
  consumed: Macros,
  goals: DailyGoals,
  timeOfDay: string,
  preferences?: string,
): Promise<MealSuggestion> {
  const remaining = {
    calories: Math.max(0, goals.calories - consumed.calories),
    protein: Math.max(0, goals.protein - consumed.protein),
    carbs: Math.max(0, goals.carbs - consumed.carbs),
  };

  const prompt = `Time: ${timeOfDay}. Remaining today — calories: ${remaining.calories}, protein: ${remaining.protein}g, carbs: ${remaining.carbs}g.${preferences ? ` Preferences: ${preferences}.` : ''} Suggest one meal.`;

  return callGemini<MealSuggestion>(
    'gemini-2.5-flash',
    prompt,
    MEAL_SUGGESTION_SYSTEM,
    MEAL_SUGGESTION_FALLBACK,
  );
}

// ─── Weekly Insights ──────────────────────────────────────────────────────────

const WEEKLY_INSIGHT_FALLBACK: WeeklyInsight = {
  summary: 'You had a solid week of tracking your nutrition.',
  highlights: ['Consistent logging', 'Good protein intake'],
  improvements: ['Increase fiber', 'Drink more water'],
  actionableTip: 'Add one serving of vegetables to your lunch each day.',
  overallScore: 6,
};

const WEEKLY_INSIGHT_SYSTEM = `You are a health coach. Return ONLY valid JSON:
{"summary":string,"highlights":string[],"improvements":string[],"actionableTip":string,"overallScore":number}
overallScore is 1-10. Arrays have 2-3 items max. Keep it concise.`;

/**
 * Generates a weekly health summary using Gemini Pro for deeper analysis.
 */
export async function generateWeeklyInsights(
  weeklyLogs: FoodLogEntry[],
  habitLogs: HabitLog[],
  goals: DailyGoals,
): Promise<WeeklyInsight> {
  const avgCalories = weeklyLogs.length
    ? Math.round(weeklyLogs.reduce((sum, e) => sum + e.analysis.macros.calories, 0) / Math.max(1, new Set(weeklyLogs.map(e => e.loggedAt.slice(0, 10))).size))
    : 0;

  const habitCompletionRate = habitLogs.length
    ? Math.round((habitLogs.reduce((sum, l) => sum + l.completed.length, 0) / (habitLogs.length * 5)) * 100)
    : 0;

  const prompt = `Weekly stats: ${weeklyLogs.length} meals logged, avg ${avgCalories} cal/day (goal: ${goals.calories}), habit completion: ${habitCompletionRate}%. Generate insights.`;

  return callGemini<WeeklyInsight>(
    'gemini-2.5-pro',
    prompt,
    WEEKLY_INSIGHT_SYSTEM,
    WEEKLY_INSIGHT_FALLBACK,
  );
}
