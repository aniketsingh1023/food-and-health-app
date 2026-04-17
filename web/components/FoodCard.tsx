'use client';

import { useState } from 'react';
import { FoodLogEntry } from '@/types';
import { NutritionGrade } from './NutritionGrade';

interface FoodCardProps {
  entry: FoodLogEntry;
  onDelete?: (id: string) => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snack',
};

const MACROS = [
  { key: 'calories' as const, label: 'Cal',    unit: 'kcal', color: '#ef4444' },
  { key: 'protein'  as const, label: 'Protein', unit: 'g',   color: '#3b82f6' },
  { key: 'carbs'    as const, label: 'Carbs',   unit: 'g',   color: '#f59e0b' },
  { key: 'fat'      as const, label: 'Fat',     unit: 'g',   color: '#8b5cf6' },
  { key: 'fiber'    as const, label: 'Fiber',   unit: 'g',   color: '#10b981' },
];

export function FoodCard({ entry, onDelete }: FoodCardProps) {
  const { analysis, mealType, loggedAt, id } = entry;
  const time = new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleDeleteClick() {
    if (confirming) {
      onDelete?.(id);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  const hasIngredients = analysis.ingredients && analysis.ingredients.length > 0;

  return (
    <article
      className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      aria-label={`Food entry: ${analysis.name}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {MEAL_LABELS[mealType] ?? mealType}
            </span>
            <span className="text-[10px] text-slate-300">{time}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">
            {analysis.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{analysis.servingSize}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <NutritionGrade score={analysis.healthScore} size="md" />
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              aria-label={confirming ? 'Confirm delete' : 'Delete entry'}
              title={confirming ? 'Tap again to confirm' : 'Remove entry'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                confirming
                  ? 'bg-red-500 text-white focus-visible:ring-red-500'
                  : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:ring-red-400'
              }`}
            >
              {confirming ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Macro row */}
      <div
        className="grid grid-cols-5 gap-1.5"
        role="list"
        aria-label="Nutrition breakdown"
      >
        {MACROS.map(m => (
          <div
            key={m.key}
            role="listitem"
            className="bg-slate-50 rounded-xl p-2 text-center"
            aria-label={`${m.label}: ${Math.round(analysis.macros[m.key])} ${m.unit}`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mx-auto mb-1"
              style={{ backgroundColor: m.color }}
              aria-hidden="true"
            />
            <p className="text-xs font-bold text-slate-700 tabular-nums leading-none">
              {Math.round(analysis.macros[m.key])}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* AI tip */}
      {analysis.tip && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
          <p className="text-[11px] text-green-800 leading-relaxed">
            <span className="font-semibold">AI tip: </span>{analysis.tip}
          </p>
        </div>
      )}

      {/* Ingredients toggle */}
      {hasIngredients && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
          >
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            {expanded ? 'Hide' : 'Show'} ingredients ({analysis.ingredients.length})
          </button>
          {expanded && (
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Ingredients list">
              {analysis.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
