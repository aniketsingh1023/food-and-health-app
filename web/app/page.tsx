/**
 * Dashboard page — daily macro rings, streak counter, recent food log.
 */

'use client';

import { MacroRing } from '@/components/MacroRing';
import { FoodCard } from '@/components/FoodCard';
import { StreakBadge } from '@/components/StreakBadge';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyStats } from '@/hooks/useDailyStats';

export default function DashboardPage() {
  const { entries } = useFoodLog();
  const { stats } = useDailyStats(entries);
  const { consumed, goals, streak } = stats;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-xl mx-auto w-full space-y-6">
      {/* Header */}
      <section aria-labelledby="dashboard-heading">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="dashboard-heading" className="text-xl font-bold text-slate-700">
              Today
            </h1>
            <p className="text-sm text-slate-400">{today}</p>
          </div>
          <StreakBadge streak={streak} />
        </div>
      </section>

      {/* Macro rings */}
      <section
        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5"
        aria-labelledby="macros-heading"
      >
        <h2 id="macros-heading" className="text-sm font-semibold text-slate-500 mb-4">
          Daily Progress
        </h2>
        <div className="flex items-center justify-around gap-2">
          <MacroRing
            label="Calories"
            value={consumed.calories}
            goal={goals.calories}
            color="#FF6B6B"
            unit="kcal"
            size={96}
          />
          <MacroRing
            label="Protein"
            value={consumed.protein}
            goal={goals.protein}
            color="#74B9FF"
            unit="g"
          />
          <MacroRing
            label="Carbs"
            value={consumed.carbs}
            goal={goals.carbs}
            color="#FDCB6E"
            unit="g"
          />
          <MacroRing
            label="Fiber"
            value={consumed.fiber}
            goal={goals.fiber}
            color="#A8E6CF"
            unit="g"
          />
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-3" aria-label="Quick stats">
        <StatCard label="Meals" value={entries.length.toString()} emoji="🍽️" />
        <StatCard label="Fat" value={`${Math.round(consumed.fat)}g`} emoji="🥑" />
        <StatCard
          label="Goal"
          value={`${goals.calories > 0 ? Math.round((consumed.calories / goals.calories) * 100) : 0}%`}
          emoji="🎯"
        />
      </section>

      {/* Today's log */}
      <section aria-labelledby="log-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="log-heading" className="text-sm font-semibold text-slate-500">
            Today&apos;s Log
          </h2>
          <a
            href="/log"
            className="text-xs text-[#00B894] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF] rounded"
            aria-label="Go to food logger to add a meal"
          >
            + Add meal
          </a>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-3xl mb-2" role="img" aria-label="empty plate">🍽️</p>
            <p className="text-sm">No meals logged yet today.</p>
            <a href="/log" className="text-xs text-[#00B894] underline mt-1 inline-block">
              Log your first meal
            </a>
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

interface StatCardProps {
  label: string;
  value: string;
  emoji: string;
}

function StatCard({ label, value, emoji }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center">
      <p className="text-xl mb-1" role="img" aria-hidden="true">{emoji}</p>
      <p className="text-base font-bold text-slate-700">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
