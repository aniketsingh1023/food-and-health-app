'use client';

import Link from 'next/link';
import { MacroRing } from '@/components/MacroRing';
import { FoodCard } from '@/components/FoodCard';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyStats } from '@/hooks/useDailyStats';

export default function DashboardPage() {
  const { entries } = useFoodLog();
  const { stats } = useDailyStats(entries);
  const { consumed, goals, streak } = stats;

  const calPct = goals.calories > 0 ? Math.round((consumed.calories / goals.calories) * 100) : 0;
  const remaining = Math.max(0, goals.calories - consumed.calories);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <main className="flex-1 px-4 py-5 pb-24 md:pb-8 max-w-2xl mx-auto w-full space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{today}</p>
          <h1 className="text-xl font-bold text-slate-800 mt-0.5">Today&apos;s Overview</h1>
        </div>
        {streak > 0 && (
          <div
            className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5 text-center"
            role="status"
            aria-label={`${streak} day streak`}
          >
            <p className="text-base font-bold text-orange-600 leading-none">{streak}</p>
            <p className="text-[10px] text-orange-400 font-medium">day streak</p>
          </div>
        )}
      </div>

      {/* ── Calorie hero card ── */}
      <section
        className="bg-white rounded-2xl border border-slate-100 p-5"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        aria-labelledby="calorie-heading"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="calorie-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Calories
          </h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            calPct > 100 ? 'bg-red-50 text-red-600' :
            calPct >= 80  ? 'bg-green-50 text-green-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            {calPct}% of goal
          </span>
        </div>

        {/* Horizontal progress bar */}
        <div className="mb-3">
          <div
            className="h-3 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(consumed.calories)}
            aria-valuemin={0}
            aria-valuemax={goals.calories}
            aria-label={`Calorie progress: ${Math.round(consumed.calories)} of ${goals.calories} kcal`}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, calPct)}%`,
                backgroundColor: calPct > 100 ? '#ef4444' : '#16a34a',
              }}
            />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-slate-800 tabular-nums leading-none">
              {Math.round(consumed.calories).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">kcal consumed</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tabular-nums leading-none" style={{ color: remaining === 0 ? '#ef4444' : '#16a34a' }}>
              {remaining.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">kcal remaining</p>
          </div>
        </div>
      </section>

      {/* ── Macro rings ── */}
      <section
        className="bg-white rounded-2xl border border-slate-100 p-5"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        aria-labelledby="macros-heading"
      >
        <h2 id="macros-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Macronutrients
        </h2>
        <div className="flex items-start justify-around">
          <MacroRing label="Protein"  value={consumed.protein} goal={goals.protein} color="#3b82f6" unit="g" />
          <MacroRing label="Carbs"    value={consumed.carbs}   goal={goals.carbs}   color="#f59e0b" unit="g" />
          <MacroRing label="Fat"      value={consumed.fat}     goal={goals.fat}     color="#8b5cf6" unit="g" />
          <MacroRing label="Fiber"    value={consumed.fiber}   goal={goals.fiber}   color="#10b981" unit="g" />
        </div>
      </section>

      {/* ── Quick action cards ── */}
      <section aria-label="Quick actions" className="grid grid-cols-2 gap-3">
        <Link
          href="/log"
          className="bg-green-600 text-white rounded-2xl p-4 flex flex-col gap-2 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 outline-none transition-colors"
          aria-label="Log a meal"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold">Log a meal</p>
            <p className="text-[11px] text-green-200">{entries.length} logged today</p>
          </div>
        </Link>

        <Link
          href="/suggest"
          className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 hover:border-slate-200 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 outline-none"
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
          aria-label="Get a meal suggestion"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">What to eat?</p>
            <p className="text-[11px] text-slate-400">AI suggestion</p>
          </div>
        </Link>
      </section>

      {/* ── Today's log ── */}
      <section aria-labelledby="log-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="log-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today&apos;s log
          </h2>
          <Link
            href="/log"
            className="text-xs text-green-600 font-semibold hover:text-green-700 focus-visible:ring-2 focus-visible:ring-green-600 rounded outline-none"
            aria-label="Go to food logger"
          >
            + Add
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2h18l-2 7H5L3 2z"/><path d="M5 9l1 13h12l1-13"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">No meals logged yet</p>
            <p className="text-xs text-slate-400 mt-1">Start tracking your nutrition</p>
            <Link
              href="/log"
              className="inline-block mt-4 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 outline-none"
            >
              Log first meal
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice().reverse().map(entry => (
              <FoodCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
