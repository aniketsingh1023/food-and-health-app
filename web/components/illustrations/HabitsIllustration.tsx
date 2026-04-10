/** Undraw-style illustration for habit tracking feature. */
export function HabitsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} role="img" aria-label="Habit tracking checklist">
      {/* Clipboard */}
      <rect x="40" y="30" width="120" height="120" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
      <rect x="70" y="22" width="60" height="18" rx="9" fill="#e2e8f0" />
      <rect x="78" y="26" width="44" height="10" rx="5" fill="#cbd5e1" />

      {/* Habit rows */}
      {[
        { y: 65,  done: true,  label: 'Drink 8 glasses',  color: '#16a34a' },
        { y: 90,  done: true,  label: 'Eat breakfast',    color: '#16a34a' },
        { y: 115, done: true,  label: '7,500 steps',      color: '#16a34a' },
        { y: 140, done: false, label: 'Sleep 7–8 hours',  color: '#e2e8f0' },
      ].map(({ y, done, label, color }) => (
        <g key={y}>
          <circle cx="60" cy={y} r="9" fill={done ? color : '#f1f5f9'} stroke={color} strokeWidth="1.5" />
          {done && (
            <path d={`M55 ${y} L59 ${y + 4} L65 ${y - 4}`} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
          <rect x="76" y={y - 5} width={done ? 80 : 70} height="10" rx="5" fill={done ? '#f0fdf4' : '#f8fafc'} />
          <text x="80" y={y + 3} fontSize="6.5" fill={done ? '#15803d' : '#94a3b8'} fontWeight={done ? '600' : '400'}>{label}</text>
        </g>
      ))}

      {/* Progress bar at top of clipboard */}
      <rect x="52" y="50" width="96" height="7" rx="3.5" fill="#f1f5f9" />
      <rect x="52" y="50" width="72" height="7" rx="3.5" fill="#16a34a" />
      <text x="100" y="46" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="600">3 / 4 done</text>

      {/* Sparkle */}
      <path d="M168 32 L170 25 L172 32 L179 34 L172 36 L170 43 L168 36 L161 34Z" fill="#f59e0b" opacity="0.8" />
    </svg>
  );
}
