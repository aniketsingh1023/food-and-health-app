'use client';

interface MacroRingProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
  size?: number;
}

const STROKE = 7;

export function MacroRing({ label, value, goal, color, unit, size = 84 }: MacroRingProps) {
  const r = (size - STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const offset = circ - (pct / 100) * circ;
  const over = goal > 0 && value > goal;

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      role="meter"
      aria-label={`${label}: ${Math.round(value)} of ${goal} ${unit}`}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={goal}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#f1f5f9" strokeWidth={STROKE}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={over ? '#ef4444' : color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-800 leading-tight tabular-nums">
            {Math.round(value)}
          </span>
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">{unit}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-slate-600">{label}</p>
        <p className="text-[10px] text-slate-400">
          {Math.round(pct)}% <span className="text-slate-300">of {goal}</span>
        </p>
      </div>
    </div>
  );
}
