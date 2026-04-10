/**
 * Unit tests for nutrition calculation utilities.
 */

import {
  sumMacros,
  progressPercent,
  remainingMacros,
  estimateCaloriesFromMacros,
  progressColor,
  calculateDayHealthScore,
  getDefaultGoals,
  formatMacro,
} from '../lib/nutritionCalc';
import { FoodLogEntry, Macros, DailyGoals } from '../types';

const makeMacros = (overrides: Partial<Macros> = {}): Macros => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  ...overrides,
});

const makeEntry = (macros: Partial<Macros>): FoodLogEntry => ({
  id: 'test-id',
  description: 'Test food',
  analysis: {
    name: 'Test food',
    macros: makeMacros(macros),
    healthScore: 7,
    tip: 'Good choice',
    servingSize: '1 serving',
    ingredients: [],
  },
  loggedAt: new Date().toISOString(),
  mealType: 'lunch',
});

describe('sumMacros', () => {
  it('returns zero macros for empty array', () => {
    const result = sumMacros([]);
    expect(result).toEqual(makeMacros());
  });

  it('sums macros from a single entry', () => {
    const entry = makeEntry({ calories: 500, protein: 30, carbs: 60, fat: 15, fiber: 5 });
    const result = sumMacros([entry]);
    expect(result.calories).toBe(500);
    expect(result.protein).toBe(30);
    expect(result.carbs).toBe(60);
    expect(result.fat).toBe(15);
    expect(result.fiber).toBe(5);
  });

  it('sums macros from multiple entries', () => {
    const e1 = makeEntry({ calories: 300, protein: 20, carbs: 40, fat: 10, fiber: 3 });
    const e2 = makeEntry({ calories: 200, protein: 10, carbs: 20, fat: 5, fiber: 2 });
    const result = sumMacros([e1, e2]);
    expect(result.calories).toBe(500);
    expect(result.protein).toBe(30);
    expect(result.fiber).toBe(5);
  });
});

describe('progressPercent', () => {
  it('returns 0 when goal is 0', () => {
    expect(progressPercent(100, 0)).toBe(0);
  });

  it('returns correct percentage', () => {
    expect(progressPercent(50, 100)).toBe(50);
    expect(progressPercent(75, 100)).toBe(75);
  });

  it('caps at 100 when value exceeds goal', () => {
    expect(progressPercent(150, 100)).toBe(100);
    expect(progressPercent(999, 100)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(progressPercent(33, 100)).toBe(33);
    expect(progressPercent(1, 3)).toBe(33);
  });
});

describe('remainingMacros', () => {
  it('returns correct remaining macros', () => {
    const consumed = makeMacros({ calories: 800, protein: 30, carbs: 100, fat: 20, fiber: 10 });
    const goals: DailyGoals = { calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 };
    const result = remainingMacros(consumed, goals);
    expect(result.calories).toBe(1200);
    expect(result.protein).toBe(20);
    expect(result.carbs).toBe(150);
  });

  it('floors remaining at 0 when over goal', () => {
    const consumed = makeMacros({ calories: 2500, protein: 80 });
    const goals: DailyGoals = { calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 };
    const result = remainingMacros(consumed, goals);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });
});

describe('estimateCaloriesFromMacros', () => {
  it('calculates calories using Atwater factors', () => {
    // 10g protein = 40 kcal, 50g carbs = 200 kcal, 10g fat = 90 kcal = 330 total
    expect(estimateCaloriesFromMacros(10, 50, 10)).toBe(330);
  });

  it('returns 0 for all zero inputs', () => {
    expect(estimateCaloriesFromMacros(0, 0, 0)).toBe(0);
  });

  it('correctly weights fat at 9 kcal/g', () => {
    expect(estimateCaloriesFromMacros(0, 0, 10)).toBe(90);
  });
});

describe('progressColor', () => {
  it('returns coral for over 100%', () => {
    expect(progressColor(101)).toBe('#FF6B6B');
    expect(progressColor(150)).toBe('#FF6B6B');
  });

  it('returns green for 90-100%', () => {
    expect(progressColor(95)).toBe('#00B894');
    expect(progressColor(100)).toBe('#00B894');
  });

  it('returns mint for 50-89%', () => {
    expect(progressColor(50)).toBe('#A8E6CF');
    expect(progressColor(89)).toBe('#A8E6CF');
  });

  it('returns amber for under 50%', () => {
    expect(progressColor(0)).toBe('#FDCB6E');
    expect(progressColor(49)).toBe('#FDCB6E');
  });
});

describe('calculateDayHealthScore', () => {
  const goals = getDefaultGoals();

  it('returns score within 1-10 range', () => {
    const consumed = makeMacros({ calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 });
    const score = calculateDayHealthScore(consumed, goals);
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(10);
  });

  it('penalizes extreme calorie excess', () => {
    const perfect = makeMacros({ calories: 2000, protein: 50, fiber: 25 });
    const over = makeMacros({ calories: 3000, protein: 50, fiber: 25 });
    expect(calculateDayHealthScore(over, goals)).toBeLessThan(calculateDayHealthScore(perfect, goals));
  });

  it('rewards hitting protein goal', () => {
    const withProtein = makeMacros({ calories: 1800, protein: 48, fiber: 22 });
    const noProtein = makeMacros({ calories: 1800, protein: 10, fiber: 22 });
    expect(calculateDayHealthScore(withProtein, goals)).toBeGreaterThan(calculateDayHealthScore(noProtein, goals));
  });
});

describe('formatMacro', () => {
  it('rounds calories to integer', () => {
    expect(formatMacro(200.7, 'kcal')).toBe('201');
  });

  it('returns integer string for whole gram values', () => {
    expect(formatMacro(25, 'g')).toBe('25');
  });

  it('returns one decimal for fractional grams', () => {
    expect(formatMacro(25.5, 'g')).toBe('25.5');
  });
});
