/**
 * Shared TypeScript types for the mobile app.
 * Mirrors web/types/index.ts — kept in sync manually.
 */

// ─── Nutrition & Food ────────────────────────────────────────────────────────

export interface Macros {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
}

export interface FoodAnalysis {
  name: string;
  macros: Macros;
  healthScore: number; // 1–10
  tip: string;
  servingSize: string;
  ingredients: string[];
}

export interface FoodLogEntry {
  id: string;
  description: string;
  analysis: FoodAnalysis;
  loggedAt: string; // ISO 8601
  mealType: MealType;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// ─── Daily Tracking ──────────────────────────────────────────────────────────

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyStats {
  date: string;
  consumed: Macros;
  goals: DailyGoals;
  streak: number;
  entries: FoodLogEntry[];
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export type HabitId = 'hydration' | 'breakfast' | 'fruits' | 'steps' | 'sleep';

export interface Habit {
  id: HabitId;
  label: string;
  emoji: string;
  target: string;
  completed: boolean;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: HabitId[];
}

export interface WeeklyHabitStats {
  habitId: HabitId;
  label: string;
  completedDays: number;
  trend: number[]; // 0 or 1 for each of 7 days
}

// ─── AI / Gemini Responses ───────────────────────────────────────────────────

export interface MealSuggestion {
  name: string;
  description: string;
  estimatedMacros: Macros;
  reason: string;
  prepTime: string;
}

export interface WeeklyInsight {
  summary: string;
  highlights: string[];
  improvements: string[];
  actionableTip: string;
  overallScore: number; // 1–10
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AnalyzeFoodRequest {
  description: string;
  mealType: MealType;
}

export interface SuggestMealRequest {
  consumed: Macros;
  goals: DailyGoals;
  timeOfDay: string;
  preferences?: string;
}

export interface WeeklyInsightsRequest {
  weeklyLogs: FoodLogEntry[];
  habitLogs: HabitLog[];
  goals: DailyGoals;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string; // ISO 8601
}

export interface ChatContext {
  consumed: Macros;
  goals: DailyGoals;
  recentMeals: string[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  context: ChatContext;
}

// ─── TDEE Calculator ─────────────────────────────────────────────────────────

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  age: number;
  weightKg: number;
  heightCm: number;
  sex: Sex;
  activity: ActivityLevel;
  goal: GoalType;
}
