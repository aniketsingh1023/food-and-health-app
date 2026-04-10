/**
 * Shared TypeScript types for the mobile app.
 * Mirrors web/types/index.ts — kept in sync manually.
 */

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodAnalysis {
  name: string;
  macros: Macros;
  healthScore: number;
  tip: string;
  servingSize: string;
  ingredients: string[];
}

export interface FoodLogEntry {
  id: string;
  description: string;
  analysis: FoodAnalysis;
  loggedAt: string;
  mealType: MealType;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type HabitId = 'hydration' | 'breakfast' | 'fruits' | 'steps' | 'sleep';

export interface Habit {
  id: HabitId;
  label: string;
  emoji: string;
  target: string;
  completed: boolean;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
