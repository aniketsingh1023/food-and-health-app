/** Undraw-style illustration for AI food analysis feature. */
export function AnalyseIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} role="img" aria-label="AI analysing a meal">
      {/* Bowl */}
      <ellipse cx="100" cy="105" rx="52" ry="14" fill="#e2e8f0" />
      <path d="M48 90 Q48 120 100 122 Q152 120 152 90Z" fill="#f1f5f9" />
      <ellipse cx="100" cy="90" rx="52" ry="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />

      {/* Food in bowl */}
      <ellipse cx="100" cy="89" rx="38" ry="10" fill="#fef3c7" />
      <circle cx="86" cy="86" r="7" fill="#ef4444" opacity="0.8" />
      <circle cx="100" cy="84" r="6" fill="#22c55e" opacity="0.9" />
      <circle cx="113" cy="87" r="5" fill="#f59e0b" opacity="0.8" />
      <circle cx="94" cy="93" r="4" fill="#3b82f6" opacity="0.7" />

      {/* AI scan line */}
      <line x1="48" y1="88" x2="152" y2="88" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />

      {/* Scan corners */}
      <path d="M55 72 L55 65 L62 65" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M145 72 L145 65 L138 65" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Floating data tags */}
      <rect x="12" y="48" width="52" height="22" rx="6" fill="#16a34a" />
      <text x="38" y="57" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">320 kcal</text>
      <text x="38" y="65" textAnchor="middle" fontSize="5" fill="#bbf7d0">analysed</text>

      <rect x="136" y="38" width="48" height="22" rx="6" fill="#3b82f6" />
      <text x="160" y="47" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">28g protein</text>
      <text x="160" y="55" textAnchor="middle" fontSize="5" fill="#bfdbfe">high</text>

      <rect x="136" y="68" width="42" height="18" rx="5" fill="#f59e0b" />
      <text x="157" y="80" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white">Grade A</text>

      {/* Sparkle */}
      <path d="M104 25 L106 18 L108 25 L115 27 L108 29 L106 36 L104 29 L97 27Z" fill="#f59e0b" />
    </svg>
  );
}
