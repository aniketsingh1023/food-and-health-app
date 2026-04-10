/** Undraw-style illustration for weekly insights feature. */
export function InsightsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} role="img" aria-label="Weekly nutrition insights chart">
      {/* Card */}
      <rect x="20" y="20" width="160" height="120" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />

      {/* Bar chart */}
      {[
        { x: 38,  h: 45, color: '#bbf7d0' },
        { x: 60,  h: 62, color: '#bbf7d0' },
        { x: 82,  h: 38, color: '#bbf7d0' },
        { x: 104, h: 70, color: '#16a34a' },
        { x: 126, h: 55, color: '#bbf7d0' },
        { x: 148, h: 80, color: '#16a34a' },
      ].map(({ x, h, color }) => (
        <g key={x}>
          <rect x={x} y={120 - h} width="16" height={h} rx="4" fill={color} />
        </g>
      ))}

      {/* Baseline */}
      <line x1="30" y1="120" x2="172" y2="120" stroke="#e2e8f0" strokeWidth="1" />

      {/* Day labels */}
      {['M','T','W','T','F','S','S'].map((d, i) => (
        <text key={i} x={46 + i * 22} y="132" textAnchor="middle" fontSize="7" fill="#94a3b8">{d}</text>
      ))}

      {/* Score badge */}
      <rect x="130" y="28" width="40" height="32" rx="8" fill="#16a34a" />
      <text x="150" y="42" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">8</text>
      <text x="150" y="53" textAnchor="middle" fontSize="6" fill="#bbf7d0">/10 week</text>

      {/* Trend line */}
      <polyline points="38,95 60,78 82,90 104,62 126,77 148,52"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="3 2" />

      {/* AI badge */}
      <rect x="30" y="28" width="48" height="18" rx="6" fill="#fef9c3" />
      <text x="54" y="40" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="#a16207">AI insights</text>
    </svg>
  );
}
