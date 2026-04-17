/**
 * TDEE (Total Daily Energy Expenditure) and BMR calculations.
 * Mirrors web/lib/tdee.ts
 */

import type { DailyGoals, ActivityLevel, GoalType, Sex, UserProfile } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateBMR(profile: UserProfile): number {
  const { age, weightKg, heightCm, sex } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateGoals(profile: UserProfile): DailyGoals {
  const bmr = calculateBMR(profile);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity];
  const calories = Math.round(tdee + GOAL_ADJUSTMENTS[profile.goal]);

  const weightLbs = profile.weightKg * 2.205;
  const protein = Math.round(weightLbs * (profile.activity === 'sedentary' ? 0.7 : 0.9));
  const fat = Math.round((calories * 0.28) / 9);
  const fiber = Math.round((calories / 1000) * 14);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return {
    calories: Math.max(1200, calories),
    protein: Math.max(40, protein),
    carbs: Math.max(50, carbs),
    fat: Math.max(30, fat),
    fiber: Math.max(15, fiber),
  };
}

export function activityLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary (desk job, no exercise)',
    light: 'Light (1-3 days exercise/week)',
    moderate: 'Moderate (3-5 days exercise/week)',
    active: 'Active (6-7 days exercise/week)',
    very_active: 'Very active (physical job + training)',
  };
  return labels[level];
}

export function goalLabel(goal: GoalType): string {
  const labels: Record<GoalType, string> = {
    lose: 'Lose weight',
    maintain: 'Maintain',
    gain: 'Gain muscle',
  };
  return labels[goal];
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary', 'light', 'moderate', 'active', 'very_active',
];

export const GOALS: GoalType[] = ['lose', 'maintain', 'gain'];
