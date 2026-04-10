/**
 * Tappable habit card with check-off animation.
 */

'use client';

import { Habit, HabitId } from '@/types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: HabitId) => void;
}

/**
 * Renders a single habit as a tappable card.
 */
export function HabitCard({ habit, onToggle }: HabitCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      aria-label={`${habit.completed ? 'Unmark' : 'Mark'} "${habit.label}" as complete`}
      aria-pressed={habit.completed}
      className={`
        w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left
        transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A8E6CF]
        ${habit.completed
          ? 'bg-[#A8E6CF]/20 border-[#A8E6CF] text-slate-700'
          : 'bg-white border-slate-100 text-slate-600 hover:border-[#A8E6CF]/50'}
      `}
    >
      {/* Emoji */}
      <span className="text-2xl" role="img" aria-hidden="true">
        {habit.emoji}
      </span>

      {/* Label + target */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${habit.completed ? 'text-slate-700' : 'text-slate-600'}`}>
          {habit.label}
        </p>
        <p className="text-xs text-slate-400">{habit.target}</p>
      </div>

      {/* Checkmark */}
      <div
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${habit.completed ? 'bg-[#A8E6CF] border-[#A8E6CF]' : 'border-slate-200'}
        `}
        aria-hidden="true"
      >
        {habit.completed && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}
