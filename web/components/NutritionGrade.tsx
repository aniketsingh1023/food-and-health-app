/**
 * Letter-grade badge for a food item's health score.
 * Maps 1-10 score to A+/A/B/C/D/F with color coding.
 */

interface NutritionGradeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

interface GradeInfo {
  letter: string;
  bg: string;
  text: string;
  label: string;
}

function getGrade(score: number): GradeInfo {
  if (score >= 9.5) return { letter: 'A+', bg: '#dcfce7', text: '#15803d', label: 'Excellent' };
  if (score >= 8)   return { letter: 'A',  bg: '#dcfce7', text: '#16a34a', label: 'Very good' };
  if (score >= 7)   return { letter: 'B',  bg: '#dbeafe', text: '#1d4ed8', label: 'Good' };
  if (score >= 5)   return { letter: 'C',  bg: '#fef9c3', text: '#a16207', label: 'Average' };
  if (score >= 3)   return { letter: 'D',  bg: '#ffedd5', text: '#c2410c', label: 'Poor' };
  return              { letter: 'F',  bg: '#fee2e2', text: '#dc2626', label: 'Avoid' };
}

const SIZES = {
  sm: { box: 'w-7 h-7',  font: 'text-xs',  label: 'text-[9px]' },
  md: { box: 'w-9 h-9',  font: 'text-sm',  label: 'text-[10px]' },
  lg: { box: 'w-12 h-12', font: 'text-base', label: 'text-xs' },
};

/** Renders a health-score letter grade badge. */
export function NutritionGrade({ score, size = 'md' }: NutritionGradeProps) {
  const grade = getGrade(score);
  const s = SIZES[size];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`${s.box} rounded-lg flex items-center justify-center font-bold ${s.font} flex-shrink-0`}
        style={{ backgroundColor: grade.bg, color: grade.text }}
        aria-label={`Nutrition grade: ${grade.letter} — ${grade.label}`}
      >
        {grade.letter}
      </div>
      {size !== 'sm' && (
        <span className={`${s.label} font-medium`} style={{ color: grade.text }}>
          {grade.label}
        </span>
      )}
    </div>
  );
}
