/**
 * Tests for useHabits hook — state, toggling, streak logic, and weekly stats.
 */

import { renderHook, act } from '@testing-library/react';
import { useHabits } from '../hooks/useHabits';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe('useHabits', () => {
  it('initializes with 5 habits, all uncompleted', () => {
    const { result } = renderHook(() => useHabits());
    expect(result.current.habits).toHaveLength(5);
    result.current.habits.forEach(habit => {
      expect(habit.completed).toBe(false);
    });
  });

  it('starts with completedCount of 0', () => {
    const { result } = renderHook(() => useHabits());
    expect(result.current.completedCount).toBe(0);
  });

  it('toggles a habit to completed', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.toggleHabit('hydration');
    });
    const hydration = result.current.habits.find(h => h.id === 'hydration');
    expect(hydration?.completed).toBe(true);
    expect(result.current.completedCount).toBe(1);
  });

  it('toggles a habit back to uncompleted', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.toggleHabit('breakfast');
    });
    act(() => {
      result.current.toggleHabit('breakfast');
    });
    const breakfast = result.current.habits.find(h => h.id === 'breakfast');
    expect(breakfast?.completed).toBe(false);
    expect(result.current.completedCount).toBe(0);
  });

  it('can complete multiple habits', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.toggleHabit('hydration');
      result.current.toggleHabit('steps');
      result.current.toggleHabit('sleep');
    });
    expect(result.current.completedCount).toBe(3);
  });

  it('persists completed habits to localStorage', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.toggleHabit('fruits');
    });
    const today = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorageMock.getItem('fh_habit_logs') ?? '[]');
    const todayLog = stored.find((l: { date: string }) => l.date === today);
    expect(todayLog).toBeDefined();
    expect(todayLog.completed).toContain('fruits');
  });

  it('returns weeklyStats for all 5 habits', () => {
    const { result } = renderHook(() => useHabits());
    expect(result.current.weeklyStats).toHaveLength(5);
  });

  it('weeklyStats has trend array of length 7', () => {
    const { result } = renderHook(() => useHabits());
    result.current.weeklyStats.forEach(stat => {
      expect(stat.trend).toHaveLength(7);
    });
  });

  it('weeklyStats reflects completedDays correctly', () => {
    const { result } = renderHook(() => useHabits());
    // All habits start at 0 completed days (fresh localStorage)
    result.current.weeklyStats.forEach(stat => {
      expect(stat.completedDays).toBe(0);
    });
  });

  it('returns today as YYYY-MM-DD string', () => {
    const { result } = renderHook(() => useHabits());
    expect(result.current.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('each habit has required fields', () => {
    const { result } = renderHook(() => useHabits());
    result.current.habits.forEach(habit => {
      expect(habit.id).toBeTruthy();
      expect(habit.label).toBeTruthy();
      expect(habit.emoji).toBeTruthy();
      expect(habit.target).toBeTruthy();
      expect(typeof habit.completed).toBe('boolean');
    });
  });
});
