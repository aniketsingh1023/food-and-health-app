'use client';

import { useState, useRef } from 'react';
import { FoodCard } from '@/components/FoodCard';
import { useFoodLog } from '@/hooks/useFoodLog';
import { MealType } from '@/types';

const MEAL_TYPES: { value: MealType; label: string; desc: string }[] = [
  { value: 'breakfast', label: 'Breakfast', desc: 'Morning meal' },
  { value: 'lunch',     label: 'Lunch',     desc: 'Midday meal' },
  { value: 'dinner',    label: 'Dinner',    desc: 'Evening meal' },
  { value: 'snack',     label: 'Snack',     desc: 'Between meals' },
];

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 20) return 'dinner';
  return 'snack';
}

const QUICK_ADDS = [
  'Black coffee',
  '2 boiled eggs',
  'Bowl of oatmeal with banana',
  'Grilled chicken breast with rice',
  'Caesar salad',
  'Protein shake',
  'Greek yogurt with berries',
  'Whole wheat toast with peanut butter',
];

export default function LogPage() {
  const { entries, isLogging, error, logFood, removeEntry } = useFoodLog();
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
    <main className="flex-1 px-4 py-5 pb-24 md:pb-8 max-w-2xl mx-auto w-full space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Log a Meal</h1>
        <p className="text-sm text-slate-400 mt-0.5">Describe what you ate — Gemini AI analyses it instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Food logging form" noValidate>

        {/* Meal type */}
        <fieldset>
          <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meal type</legend>
          <div className="grid grid-cols-4 gap-2">
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
                <span className={`block text-center px-2 py-2.5 rounded-xl border-2 transition-all text-xs font-semibold ${
                  mealType === type.value
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Description input */}
        <div>
          <label htmlFor="food-description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            What did you eat?
          </label>
          <textarea
            id="food-description"
            ref={textareaRef}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. 2 scrambled eggs with whole wheat toast and a glass of orange juice"
            rows={3}
            disabled={isLogging}
            aria-describedby="food-desc-hint"
            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 resize-none outline-none focus:border-green-500 transition-colors disabled:opacity-60"
          />
          <p id="food-desc-hint" className="text-xs text-slate-400 mt-1.5">
            Include portions and cooking methods for better accuracy.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLogging || !description.trim()}
          aria-busy={isLogging}
          className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl text-sm
            hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
            outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-colors"
        >
          {isLogging ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
              Analysing with Gemini…
            </span>
          ) : 'Analyse & Log'}
        </button>

        {lastLogged && !isLogging && (
          <p className="text-sm text-green-600 text-center font-medium" role="status" aria-live="polite">
            Logged: {lastLogged}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center" role="alert" aria-live="assertive">{error}</p>
        )}
      </form>

      {/* Quick add */}
      <section aria-labelledby="quick-add-heading">
        <h2 id="quick-add-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Quick add
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADDS.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setDescription(item)}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-green-400 hover:text-green-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              aria-label={`Quick add: ${item}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Today's entries */}
      {entries.length > 0 && (
        <section aria-labelledby="todays-log-heading">
          <h2 id="todays-log-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Today&apos;s entries · {entries.length} meal{entries.length !== 1 ? 's' : ''}
          </h2>
          <div className="space-y-3">
            {entries.slice().reverse().map(entry => (
              <FoodCard key={entry.id} entry={entry} onDelete={removeEntry} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
