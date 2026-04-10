/**
 * Core TypeScript interfaces for the Food & Health App.
 * Single source of truth for all data shapes.
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

// ─── Daily Tracking ───────────────────────────────────────────────────────────

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
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
  completedDays: number; // out of 7
  trend: number[]; // boolean as 0|1 for 7 days
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
  timeOfDay: string; // e.g. "morning", "afternoon", "evening"
  preferences?: string;
}

export interface WeeklyInsightsRequest {
  weeklyLogs: FoodLogEntry[];
  habitLogs: HabitLog[];
  goals: DailyGoals;
}

// ─── Chat / Conversational AI ─────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string; // ISO 8601
}

export interface ChatContext {
  consumed: Macros;
  goals: DailyGoals;
  recentMeals: string[]; // last 5 food descriptions
}

export interface ChatRequest {
  messages: ChatMessage[];
  context: ChatContext;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface MacroRingProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}
