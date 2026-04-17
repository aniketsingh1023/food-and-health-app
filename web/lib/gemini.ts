/**
 * Gemini AI client with typed prompts, structured JSON output,
 * automatic retry on 503, and model fallback chain.
 */

import {
  FoodAnalysis,
  MealSuggestion,
  WeeklyInsight,
  Macros,
  DailyGoals,
  FoodLogEntry,
  HabitLog,
  HabitId,
} from '@/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash';

/** Fallback chain per model */
const MODEL_FALLBACKS: Record<GeminiModel, GeminiModel[]> = {
  'gemini-2.5-flash': ['gemini-2.0-flash'],
  'gemini-2.5-pro':   ['gemini-2.5-flash', 'gemini-2.0-flash'],
  'gemini-2.0-flash': [],
};

/**
 * Simple in-memory cache for repeated food lookups.
 *
 * Cache key is `description.toLowerCase().trim()`. This means semantically
 * equivalent but lexically different inputs (e.g. "2 eggs" vs "two eggs") will
 * NOT share a cache entry — that is an intentional trade-off to avoid complex
 * NLP normalisation on the hot path. The cache only prevents duplicate network
 * calls for identical strings within the same server instance lifetime.
 */
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

async function callModel<T>(
  model: GeminiModel,
  body: GeminiRequest,
  apiKey: string,
): Promise<{ data: T | null; retryable: boolean }> {
  const res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 503 || res.status === 429) {
    return { data: null, retryable: true };
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const json = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return { data: null, retryable: false };

  try {
    return { data: JSON.parse(text) as T, retryable: false };
  } catch {
    return { data: null, retryable: false };
  }
}

/**
 * Calls Gemini with automatic retry (once) and model fallback on 503/429.
 *
 * @param model            Primary Gemini model to use.
 * @param prompt           The user-facing prompt text.
 * @param systemInstruction System-level instruction that shapes response format.
 * @param fallback         Typed value returned when all models/retries fail.
 * @param maxOutputTokens  Token budget for the response (default 1024).
 */
async function callGemini<T>(
  model: GeminiModel,
  prompt: string,
  systemInstruction: string,
  fallback: T,
  maxOutputTokens = 1024,
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const body: GeminiRequest = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens,
    },
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  const modelsToTry: GeminiModel[] = [model, ...MODEL_FALLBACKS[model]];

  for (const m of modelsToTry) {
    // Try each model up to 2 times before moving to the fallback model
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000));
      const { data, retryable } = await callModel<T>(m, body, apiKey);
      if (data !== null) return data;
      // Non-retryable (malformed JSON, empty response) — no point trying other models
      if (!retryable) return fallback;
      // Retryable (503/429) — loop to retry or move to next model
    }
  }

  return fallback;
}

/**
 * Strips characters that could break out of the prompt's quoted context and
 * limits the string to `maxLength` characters. This is a defence-in-depth
 * measure; the primary safeguard is the structured JSON response mode which
 * instructs the model to produce only JSON.
 */
function sanitizeUserInput(input: string, maxLength: number): string {
  return input
    .slice(0, maxLength)
    // Remove prompt-injection delimiters used in common jailbreak patterns
    .replace(/[<>{}[\]\\]/g, '')
    .trim();
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
 * Sends a meal description to Gemini Flash and returns structured nutrition data.
 *
 * Results are cached in-memory by the trimmed, lowercased description to avoid
 * redundant API calls for repeated identical inputs within a server instance.
 *
 * @param description  Plain-English meal description (max 500 chars, pre-trimmed).
 */
export async function analyzeFood(description: string): Promise<FoodAnalysis> {
  const cacheKey = description.toLowerCase().trim();
  const cached = foodCache.get(cacheKey);
  if (cached) return cached;

  const safe = sanitizeUserInput(description, 500);

  const result = await callGemini<FoodAnalysis>(
    'gemini-2.5-flash',
    `Analyze this meal for nutrition: "${safe}"`,
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
 * Generates a single meal suggestion based on remaining daily macros.
 *
 * @param consumed   Macros already consumed today.
 * @param goals      The user's daily macro goals.
 * @param timeOfDay  "morning" | "afternoon" | "evening" — informs meal type.
 * @param preferences Optional free-text dietary preferences (max 200 chars).
 */
export async function suggestMeal(
  consumed: Macros,
  goals: DailyGoals,
  timeOfDay: string,
  preferences?: string,
): Promise<MealSuggestion> {
  const remaining = {
    calories: Math.max(0, goals.calories - consumed.calories),
    protein:  Math.max(0, goals.protein  - consumed.protein),
    carbs:    Math.max(0, goals.carbs    - consumed.carbs),
  };

  const safePrefs = preferences ? sanitizeUserInput(preferences, 200) : null;
  const safeTime  = sanitizeUserInput(timeOfDay, 20);

  const prompt = `Time: ${safeTime}. Remaining today — calories: ${remaining.calories}, protein: ${remaining.protein}g, carbs: ${remaining.carbs}g.${safePrefs ? ` Preferences: ${safePrefs}.` : ''} Suggest one meal.`;

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

/** All defined habit IDs in display order. */
const ALL_HABIT_IDS: HabitId[] = ['hydration', 'breakfast', 'fruits', 'steps', 'sleep'];

/**
 * Generates a rich weekly health summary using Gemini Pro.
 *
 * The prompt includes:
 * - Average daily calorie intake vs goal
 * - Per-macro averages vs goals
 * - Top 5 most-logged foods
 * - Days with zero food entries (tracking gaps)
 * - Per-habit completion rate across the week
 *
 * @param weeklyLogs  All food log entries from the last 7 days.
 * @param habitLogs   Habit completion logs for each of the last 7 days.
 * @param goals       The user's daily macro goals.
 */
export async function generateWeeklyInsights(
  weeklyLogs: FoodLogEntry[],
  habitLogs: HabitLog[],
  goals: DailyGoals,
): Promise<WeeklyInsight> {
  // ── Calorie & macro averages ──────────────────────────────────────────────
  const uniqueDays = new Set(weeklyLogs.map(e => e.loggedAt.slice(0, 10)));
  const trackedDayCount = Math.max(1, uniqueDays.size);

  const totals = weeklyLogs.reduce(
    (acc, e) => ({
      calories: acc.calories + e.analysis.macros.calories,
      protein:  acc.protein  + e.analysis.macros.protein,
      carbs:    acc.carbs    + e.analysis.macros.carbs,
      fat:      acc.fat      + e.analysis.macros.fat,
      fiber:    acc.fiber    + e.analysis.macros.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const avg = {
    calories: Math.round(totals.calories / trackedDayCount),
    protein:  Math.round(totals.protein  / trackedDayCount),
    carbs:    Math.round(totals.carbs    / trackedDayCount),
    fat:      Math.round(totals.fat      / trackedDayCount),
    fiber:    Math.round(totals.fiber    / trackedDayCount),
  };

  // ── Top 5 most-logged foods ───────────────────────────────────────────────
  const foodFrequency = new Map<string, number>();
  for (const entry of weeklyLogs) {
    const name = entry.analysis.name;
    foodFrequency.set(name, (foodFrequency.get(name) ?? 0) + 1);
  }
  const topFoods = [...foodFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} (×${count})`);

  // ── Days with zero entries ────────────────────────────────────────────────
  const today = new Date();
  const allWeekDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    allWeekDays.push(d.toISOString().slice(0, 10));
  }
  const zeroDays = allWeekDays.filter(d => !uniqueDays.has(d)).length;

  // ── Per-habit completion rate ─────────────────────────────────────────────
  const habitStats = ALL_HABIT_IDS.map(id => {
    const completedDays = habitLogs.filter(l => l.completed.includes(id)).length;
    return `${id}: ${completedDays}/7 days`;
  }).join(', ');

  const prompt = [
    `Weekly nutrition summary (last 7 days):`,
    `- Meals logged: ${weeklyLogs.length} across ${trackedDayCount} days (${zeroDays} day${zeroDays !== 1 ? 's' : ''} with no entries)`,
    `- Avg daily calories: ${avg.calories} kcal (goal: ${goals.calories} kcal)`,
    `- Avg protein: ${avg.protein}g (goal: ${goals.protein}g)`,
    `- Avg carbs: ${avg.carbs}g (goal: ${goals.carbs}g)`,
    `- Avg fat: ${avg.fat}g (goal: ${goals.fat}g)`,
    `- Avg fiber: ${avg.fiber}g (goal: ${goals.fiber}g)`,
    topFoods.length ? `- Top foods: ${topFoods.join('; ')}` : `- No foods logged`,
    `- Habit completion — ${habitStats}`,
    `Generate personalised insights based on this data.`,
  ].join('\n');

  // Use 2048 tokens — Pro model generating multi-section JSON with arrays
  return callGemini<WeeklyInsight>(
    'gemini-2.5-pro',
    prompt,
    WEEKLY_INSIGHT_SYSTEM,
    WEEKLY_INSIGHT_FALLBACK,
    2048,
  );
}
