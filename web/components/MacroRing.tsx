/**
 * Circular progress ring component for displaying macro goals.
 * Pure SVG — no external dependencies.
 */

'use client';

import { progressColor } from '@/lib/nutritionCalc';

interface MacroRingProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
  size?: number;
}

const STROKE_WIDTH = 8;

/**
 * Renders a circular SVG progress ring with label and value.
 */
export function MacroRing({ label, value, goal, color, unit, size = 88 }: MacroRingProps) {
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const dashOffset = circumference - (percent / 100) * circumference;
  const displayColor = color || progressColor(percent);

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="meter"
      aria-label={`${label}: ${Math.round(value)} of ${goal} ${unit}`}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={goal}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={displayColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-700 leading-tight">
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-slate-400">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500 text-center">{label}</span>
      <span className="text-[10px] text-slate-400">{Math.round(percent)}%</span>
    </div>
  );
}
