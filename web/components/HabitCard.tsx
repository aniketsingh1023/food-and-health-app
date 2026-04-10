'use client';

import { Habit, HabitId } from '@/types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: HabitId) => void;
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      aria-label={`${habit.completed ? 'Unmark' : 'Mark'} "${habit.label}" as complete`}
      aria-pressed={habit.completed}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left outline-none
        focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2
        transition-all duration-150 ${
          habit.completed
            ? 'bg-green-50 border-green-200'
            : 'bg-white border-slate-100 hover:border-slate-200'
        }`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          habit.completed ? 'bg-green-600' : 'bg-slate-100'
        }`}
        aria-hidden="true"
      >
        <HabitIcon id={habit.id} completed={habit.completed} />
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${habit.completed ? 'text-green-800' : 'text-slate-700'}`}>
          {habit.label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{habit.target}</p>
      </div>

      {/* Checkmark */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          habit.completed ? 'bg-green-600 border-green-600' : 'border-slate-300'
        }`}
        aria-hidden="true"
      >
        {habit.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

function HabitIcon({ id, completed }: { id: string; completed: boolean }) {
  const stroke = completed ? 'white' : '#94a3b8';
  const icons: Record<string, React.ReactNode> = {
    hydration: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
    breakfast: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      </svg>
    ),
    fruits: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    steps: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    sleep: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  };
  return <>{icons[id] ?? null}</>;
}
