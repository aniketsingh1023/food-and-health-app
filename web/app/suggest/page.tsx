/**
 * AI Meal Suggestions page — context-aware meal recommendations.
 */

'use client';

import { useState } from 'react';
import { MealSuggestion } from '@/types';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyStats } from '@/hooks/useDailyStats';
import { getTimeOfDay } from '@/lib/nutritionCalc';

export default function SuggestPage() {
  const { entries } = useFoodLog();
  const { stats } = useDailyStats(entries);
  const [suggestion, setSuggestion] = useState<MealSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');

  async function fetchSuggestion() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/suggest-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumed: stats.consumed,
          goals: stats.goals,
          timeOfDay: getTimeOfDay(),
          preferences: preferences.trim() || undefined,
        }),
      });

      const { data, error: apiError } = await res.json() as {
        data: MealSuggestion | null;
        error: string | null;
      };

      if (apiError || !data) {
        setError(apiError ?? 'Could not fetch suggestion');
      } else {
        setSuggestion(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-xl mx-auto w-full space-y-6">
      {/* Header */}
      <section aria-labelledby="suggest-heading">
        <h1 id="suggest-heading" className="text-xl font-bold text-slate-700">What to Eat Next?</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          AI considers your remaining macros and time of day.
        </p>
      </section>

      {/* Context summary */}
      <section
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2"
        aria-label="Today's nutrition context"
      >
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today so far</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <ContextRow label="Calories" consumed={stats.consumed.calories} goal={stats.goals.calories} unit="kcal" />
          <ContextRow label="Protein" consumed={stats.consumed.protein} goal={stats.goals.protein} unit="g" />
          <ContextRow label="Carbs" consumed={stats.consumed.carbs} goal={stats.goals.carbs} unit="g" />
          <ContextRow label="Fiber" consumed={stats.consumed.fiber} goal={stats.goals.fiber} unit="g" />
        </div>
        <p className="text-xs text-slate-400">Time: {getTimeOfDay()}</p>
      </section>

      {/* Preferences */}
      <div>
        <label htmlFor="preferences" className="text-sm font-semibold text-slate-500 block mb-2">
          Any preferences? <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="preferences"
          type="text"
          value={preferences}
          onChange={e => setPreferences(e.target.value)}
          placeholder="e.g. vegetarian, quick prep, high protein…"
          className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#A8E6CF] transition-colors"
        />
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={fetchSuggestion}
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full bg-[#FF6B6B] text-white font-semibold py-3.5 rounded-2xl
          transition-all duration-150 hover:bg-[#ff5252] disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B6B]"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Thinking…
          </span>
        ) : (
          '✨ Suggest a Meal'
        )}
      </button>

      {error && (
        <p className="text-sm text-[#FF6B6B] text-center" role="alert">{error}</p>
      )}

      {/* Suggestion card */}
      {suggestion && !isLoading && (
        <section
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4"
          aria-labelledby="suggestion-name"
          aria-live="polite"
        >
          <div>
            <p className="text-xs text-[#00B894] font-semibold uppercase tracking-wider">AI Suggestion</p>
            <h2 id="suggestion-name" className="text-lg font-bold text-slate-700 mt-1">
              {suggestion.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{suggestion.description}</p>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Cal', value: suggestion.estimatedMacros.calories, unit: 'kcal' },
              { label: 'Pro', value: suggestion.estimatedMacros.protein, unit: 'g' },
              { label: 'Carb', value: suggestion.estimatedMacros.carbs, unit: 'g' },
              { label: 'Fat', value: suggestion.estimatedMacros.fat, unit: 'g' },
              { label: 'Fiber', value: suggestion.estimatedMacros.fiber, unit: 'g' },
            ].map(m => (
              <div key={m.label} className="text-center bg-slate-50 rounded-xl py-2">
                <p className="text-sm font-bold text-slate-700">{Math.round(m.value)}</p>
                <p className="text-[10px] text-slate-400">{m.unit}</p>
                <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 bg-[#A8E6CF]/10 rounded-xl px-3 py-2">
              💡 {suggestion.reason}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span aria-hidden="true">⏱</span> Prep time: {suggestion.prepTime}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSuggestion}
            className="w-full border-2 border-slate-200 text-slate-600 font-medium py-2.5 rounded-2xl
              hover:border-[#A8E6CF] transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF]"
            aria-label="Get another meal suggestion"
          >
            Try another suggestion
          </button>
        </section>
      )}
    </main>
  );
}

interface ContextRowProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
}

function ContextRow({ label, consumed, goal, unit }: ContextRowProps) {
  const remaining = Math.max(0, goal - consumed);
  return (
    <div>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-slate-700 font-semibold">
        {Math.round(remaining)}<span className="text-slate-400 font-normal text-xs"> {unit} left</span>
      </p>
    </div>
  );
}
