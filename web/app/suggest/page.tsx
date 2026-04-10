'use client';

import { useState } from 'react';
import { MealSuggestion } from '@/types';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyStats } from '@/hooks/useDailyStats';
import { getTimeOfDay } from '@/lib/nutritionCalc';

const MACRO_ROWS = [
  { key: 'calories' as const, label: 'Calories', unit: 'kcal', color: '#ef4444' },
  { key: 'protein'  as const, label: 'Protein',  unit: 'g',   color: '#3b82f6' },
  { key: 'carbs'    as const, label: 'Carbs',    unit: 'g',   color: '#f59e0b' },
  { key: 'fat'      as const, label: 'Fat',      unit: 'g',   color: '#8b5cf6' },
];

const PREFERENCE_CHIPS = [
  'High protein', 'Low carb', 'Vegetarian', 'Quick prep',
  'Light meal', 'Post-workout', 'Budget-friendly',
];

export default function SuggestPage() {
  const { entries } = useFoodLog();
  const { stats } = useDailyStats(entries);
  const [suggestion, setSuggestion] = useState<MealSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  function toggleChip(chip: string) {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  }

  async function fetchSuggestion() {
    setLoading(true);
    setError(null);
    const allPrefs = [...selectedChips, preferences.trim()].filter(Boolean).join(', ');
    try {
      const res = await fetch('/api/suggest-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumed: stats.consumed,
          goals: stats.goals,
          timeOfDay: getTimeOfDay(),
          preferences: allPrefs || undefined,
        }),
      });
      const { data, error: apiError } = await res.json() as { data: MealSuggestion | null; error: string | null };
      if (apiError || !data) { setError(apiError ?? 'Could not fetch suggestion'); return; }
      setSuggestion(data);
    } catch {
      setError('Network error — check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const { consumed, goals } = stats;

  return (
    <main className="flex-1 px-4 py-5 pb-24 md:pb-8 max-w-2xl mx-auto w-full space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">What to Eat Next?</h1>
        <p className="text-sm text-slate-400 mt-0.5">AI picks the best meal for your remaining macros.</p>
      </div>

      {/* Remaining macros */}
      <section
        className="bg-white rounded-2xl border border-slate-100 p-4"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        aria-labelledby="remaining-heading"
      >
        <h2 id="remaining-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Remaining today · {getTimeOfDay()}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {MACRO_ROWS.map(m => {
            const remaining = Math.max(0, goals[m.key] - consumed[m.key]);
            const pct = goals[m.key] > 0 ? Math.round((consumed[m.key] / goals[m.key]) * 100) : 0;
            return (
              <div key={m.key} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1.5" style={{ backgroundColor: m.color }} aria-hidden="true" />
                <p className="text-sm font-bold text-slate-800 tabular-nums">{Math.round(remaining)}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{m.unit} left</p>
                <p className="text-[9px] font-medium mt-1" style={{ color: pct > 90 ? '#ef4444' : '#94a3b8' }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Preference chips */}
      <section aria-labelledby="prefs-heading">
        <h2 id="prefs-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Preferences
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {PREFERENCE_CHIPS.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => toggleChip(chip)}
              aria-pressed={selectedChips.includes(chip)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium outline-none focus-visible:ring-2 focus-visible:ring-green-600 transition-colors ${
                selectedChips.includes(chip)
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={preferences}
          onChange={e => setPreferences(e.target.value)}
          placeholder="Or describe any other preference…"
          aria-label="Custom food preference"
          className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:border-green-500 transition-colors"
        />
      </section>

      {/* CTA */}
      <button
        type="button"
        onClick={fetchSuggestion}
        disabled={loading}
        aria-busy={loading}
        className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl text-sm
          hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
          outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-colors"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Thinking…
          </span>
        ) : 'Get Meal Suggestion'}
      </button>

      {error && <p className="text-sm text-red-500 text-center" role="alert">{error}</p>}

      {/* Suggestion card */}
      {suggestion && !loading && (
        <section
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
          aria-labelledby="suggestion-name"
          aria-live="polite"
        >
          {/* Green header strip */}
          <div className="bg-green-600 px-5 py-4">
            <p className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-0.5">AI Recommendation</p>
            <h2 id="suggestion-name" className="text-lg font-bold text-white">{suggestion.name}</h2>
            <p className="text-sm text-green-100 mt-1">{suggestion.description}</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Estimated macros */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Estimated nutrition</p>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'Cal',    value: suggestion.estimatedMacros.calories, unit: 'kcal', color: '#ef4444' },
                  { label: 'Protein', value: suggestion.estimatedMacros.protein, unit: 'g',   color: '#3b82f6' },
                  { label: 'Carbs',  value: suggestion.estimatedMacros.carbs,   unit: 'g',   color: '#f59e0b' },
                  { label: 'Fat',    value: suggestion.estimatedMacros.fat,     unit: 'g',   color: '#8b5cf6' },
                  { label: 'Fiber',  value: suggestion.estimatedMacros.fiber,   unit: 'g',   color: '#10b981' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-2 text-center">
                    <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1" style={{ backgroundColor: m.color }} aria-hidden="true" />
                    <p className="text-xs font-bold text-slate-700 tabular-nums">{Math.round(m.value)}</p>
                    <p className="text-[9px] text-slate-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why + prep time */}
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                <p className="text-xs text-green-800 leading-relaxed">
                  <span className="font-semibold">Why this meal: </span>{suggestion.reason}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Prep time: <span className="font-semibold text-slate-600">{suggestion.prepTime}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchSuggestion}
              disabled={loading}
              className="w-full border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm
                hover:border-green-400 hover:text-green-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600"
            >
              Try a different suggestion
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
