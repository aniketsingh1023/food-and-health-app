'use client';

import { HabitCard } from '@/components/HabitCard';
import { useHabits } from '@/hooks/useHabits';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitsPage() {
  const { habits, toggleHabit, completedCount, weeklyStats } = useHabits();
  const total = habits.length;
  const pct = Math.round((completedCount / total) * 100);

  return (
    <main className="flex-1 px-4 py-5 pb-24 md:pb-8 max-w-2xl mx-auto w-full space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Daily Habits</h1>
        <p className="text-sm text-slate-400 mt-0.5">Small actions, compounded daily.</p>
      </div>

      {/* Progress summary */}
      <section
        className="bg-white rounded-2xl border border-slate-100 p-4"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        aria-labelledby="habit-progress-heading"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id="habit-progress-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Today
          </h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            pct === 100 ? 'bg-green-100 text-green-700' :
            pct >= 60   ? 'bg-blue-50 text-blue-600' :
            'bg-slate-100 text-slate-500'
          }`}>
            {completedCount} / {total}
          </span>
        </div>
        <div
          className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${completedCount} of ${total} habits completed`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: pct === 100 ? '#16a34a' : '#3b82f6',
            }}
          />
        </div>
        {pct === 100 && (
          <p className="text-xs text-green-600 font-semibold mt-2 text-center" role="status">
            All habits complete for today.
          </p>
        )}
      </section>

      {/* Habit list */}
      <section aria-labelledby="habits-list-heading" className="space-y-2.5">
        <h2 id="habits-list-heading" className="sr-only">Today&apos;s habits</h2>
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))}
      </section>

      {/* Weekly trend */}
      <section
        className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        aria-labelledby="weekly-heading"
      >
        <h2 id="weekly-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          This Week
        </h2>

        <div className="space-y-3.5">
          {weeklyStats.map(stat => (
            <div key={stat.habitId}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-600 truncate max-w-50">{stat.label}</p>
                <p className="text-xs text-slate-400 shrink-0 ml-2">{stat.completedDays}/7 days</p>
              </div>
              <div
                className="flex gap-1"
                role="list"
                aria-label={`${stat.label}: weekly completion`}
              >
                {stat.trend.map((done, i) => (
                  <div
                    key={i}
                    role="listitem"
                    title={`${DAY_LABELS[i]}: ${done ? 'completed' : 'missed'}`}
                    aria-label={`${DAY_LABELS[i]}: ${done ? 'completed' : 'missed'}`}
                    className="flex-1 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: done ? '#16a34a' : '#f1f5f9' }}
                  >
                    <span className="text-[9px] font-medium" style={{ color: done ? 'white' : '#94a3b8' }}>
                      {DAY_LABELS[i].charAt(0)}
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
