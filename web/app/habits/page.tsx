/**
 * Habit Tracker page — 5 daily habits with weekly trend view.
 */

'use client';

import { HabitCard } from '@/components/HabitCard';
import { useHabits } from '@/hooks/useHabits';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitsPage() {
  const { habits, toggleHabit, completedCount, weeklyStats } = useHabits();
  const totalHabits = habits.length;

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-xl mx-auto w-full space-y-6">
      {/* Header */}
      <section aria-labelledby="habits-heading">
        <h1 id="habits-heading" className="text-xl font-bold text-slate-700">Daily Habits</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {completedCount} of {totalHabits} done today
        </p>
        {/* Progress bar */}
        <div
          className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalHabits}
          aria-label={`Habit progress: ${completedCount} of ${totalHabits} completed`}
        >
          <div
            className="h-full bg-[#A8E6CF] rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalHabits) * 100}%` }}
          />
        </div>
      </section>

      {/* Habit cards */}
      <section aria-labelledby="habit-list-heading" className="space-y-3">
        <h2 id="habit-list-heading" className="sr-only">Today&apos;s habits</h2>
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))}
      </section>

      {/* Weekly trend */}
      <section
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5"
        aria-labelledby="weekly-trend-heading"
      >
        <h2 id="weekly-trend-heading" className="text-sm font-semibold text-slate-500 mb-4">
          This Week
        </h2>
        <div className="space-y-3">
          {weeklyStats.map(stat => (
            <div key={stat.habitId} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 font-medium truncate max-w-[180px]">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-400 flex-shrink-0">
                  {stat.completedDays}/7
                </p>
              </div>
              <div
                className="flex gap-1"
                role="list"
                aria-label={`${stat.label} weekly trend`}
              >
                {stat.trend.map((done, idx) => (
                  <div
                    key={idx}
                    role="listitem"
                    aria-label={`${DAY_LABELS[idx]}: ${done ? 'completed' : 'not completed'}`}
                    className={`
                      flex-1 h-5 rounded-sm flex items-center justify-center
                      ${done ? 'bg-[#A8E6CF]' : 'bg-slate-100'}
                    `}
                  >
                    <span className="text-[8px] text-slate-500" aria-hidden="true">
                      {DAY_LABELS[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
