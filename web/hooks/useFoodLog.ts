/**
 * Custom hook for managing the food log state.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FoodLogEntry, MealType } from '@/types';
import { getFoodLogForDate, addFoodLogEntry } from '@/lib/storage';

interface LogFoodParams {
  description: string;
  mealType: MealType;
}

interface UseFoodLogReturn {
  entries: FoodLogEntry[];
  isLogging: boolean;
  error: string | null;
  logFood: (params: LogFoodParams) => Promise<FoodLogEntry | null>;
  refresh: () => void;
}

/**
 * Manages today's food log entries.
 * Calls the analyze-food API route and persists results.
 */
export function useFoodLog(): UseFoodLogReturn {
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEntries(getFoodLogForDate(today));
  }, [today]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logFood = useCallback(async ({ description, mealType }: LogFoodParams): Promise<FoodLogEntry | null> => {
    setIsLogging(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, mealType }),
      });

      const { data, error: apiError } = await res.json() as {
        data: FoodLogEntry | null;
        error: string | null;
      };

      if (apiError || !data) {
        setError(apiError ?? 'Failed to analyze food');
        return null;
      }

      addFoodLogEntry(data);
      refresh();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, [refresh]);

  return { entries, isLogging, error, logFood, refresh };
}
