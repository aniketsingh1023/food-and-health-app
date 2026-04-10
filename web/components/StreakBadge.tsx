/**
 * Displays the current day streak with a fire animation.
 */

interface StreakBadgeProps {
  streak: number;
}

/** Renders a streak badge. */
export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full px-3 py-1.5"
      aria-label={`${streak} day streak`}
      role="status"
    >
      <span className="text-base" role="img" aria-hidden="true">🔥</span>
      <span className="text-sm font-bold">{streak}</span>
      <span className="text-xs font-medium">day streak</span>
    </div>
  );
}
