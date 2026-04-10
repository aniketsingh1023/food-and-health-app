/**
 * Food Logger page — text input with AI analysis feedback.
 */

'use client';

import { useState, useRef } from 'react';
import { FoodCard } from '@/components/FoodCard';
import { useFoodLog } from '@/hooks/useFoodLog';
import { MealType } from '@/types';

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
];

/** Smart guesses the current meal type based on time. */
function guessMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 20) return 'dinner';
  return 'snack';
}

export default function LogPage() {
  const { entries, isLogging, error, logFood } = useFoodLog();
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || isLogging) return;

    const entry = await logFood({ description: description.trim(), mealType });
    if (entry) {
      setLastLogged(entry.analysis.name);
      setDescription('');
      textareaRef.current?.focus();
    }
  }

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-xl mx-auto w-full space-y-6">
      {/* Header */}
      <section aria-labelledby="log-heading">
        <h1 id="log-heading" className="text-xl font-bold text-slate-700">Log a Meal</h1>
        <p className="text-sm text-slate-400 mt-0.5">Describe what you ate — AI does the rest.</p>
      </section>

      {/* Logger form */}
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Food logging form" noValidate>
        {/* Meal type selector */}
        <fieldset>
          <legend className="text-sm font-semibold text-slate-500 mb-2">Meal type</legend>
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Select meal type">
            {MEAL_TYPES.map(type => (
              <label key={type.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  value={type.value}
                  checked={mealType === type.value}
                  onChange={() => setMealType(type.value)}
                  className="sr-only"
                  aria-label={type.label}
                />
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    border-2 transition-all duration-150
                    ${mealType === type.value
                      ? 'bg-[#A8E6CF]/20 border-[#A8E6CF] text-slate-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                  `}
                >
                  <span aria-hidden="true">{type.emoji}</span>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Food description */}
        <div>
          <label htmlFor="food-description" className="text-sm font-semibold text-slate-500 block mb-2">
            What did you eat?
          </label>
          <textarea
            id="food-description"
            ref={textareaRef}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. 2 scrambled eggs with whole wheat toast and a glass of orange juice"
            rows={3}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:border-[#A8E6CF] transition-colors"
            aria-describedby="food-description-hint"
            disabled={isLogging}
          />
          <p id="food-description-hint" className="text-xs text-slate-400 mt-1">
            Be descriptive — include portions, cooking methods, and ingredients for best accuracy.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLogging || !description.trim()}
          aria-busy={isLogging}
          className="w-full bg-[#FF6B6B] text-white font-semibold py-3.5 rounded-2xl
            transition-all duration-150 hover:bg-[#ff5252] disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B6B]"
        >
          {isLogging ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
              Analyzing with AI…
            </span>
          ) : (
            'Analyze & Log'
          )}
        </button>

        {/* Success notice */}
        {lastLogged && !isLogging && (
          <p className="text-sm text-[#00B894] text-center font-medium" role="status" aria-live="polite">
            ✓ Logged: {lastLogged}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-[#FF6B6B] text-center" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
      </form>

      {/* Today's entries */}
      {entries.length > 0 && (
        <section aria-labelledby="todays-entries-heading">
          <h2 id="todays-entries-heading" className="text-sm font-semibold text-slate-500 mb-3">
            Today&apos;s entries
          </h2>
          <div className="space-y-3">
            {entries.slice().reverse().map(entry => (
              <FoodCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
