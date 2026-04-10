/**
 * Hero illustration — person holding a phone showing nutrition data.
 * Undraw-style: flat, rounded, brand green.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Person tracking nutrition on a smartphone"
    >
      {/* Background circle */}
      <circle cx="280" cy="210" r="180" fill="#f0fdf4" />

      {/* Phone body */}
      <rect x="210" y="90" width="140" height="240" rx="18" fill="#1e293b" />
      <rect x="218" y="100" width="124" height="220" rx="12" fill="#f8fafc" />
      {/* Phone notch */}
      <rect x="245" y="93" width="70" height="10" rx="5" fill="#334155" />

      {/* Phone screen — calorie ring */}
      <circle cx="280" cy="195" r="42" stroke="#e2e8f0" strokeWidth="8" fill="none" />
      <circle cx="280" cy="195" r="42" stroke="#16a34a" strokeWidth="8" fill="none"
        strokeLinecap="round"
        strokeDasharray="197"
        strokeDashoffset="59"
        transform="rotate(-90 280 195)"
      />
      <text x="280" y="191" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f172a">1,340</text>
      <text x="280" y="204" textAnchor="middle" fontSize="8" fill="#94a3b8">kcal</text>

      {/* Macro bars on phone */}
      <rect x="228" y="250" width="104" height="6" rx="3" fill="#e2e8f0" />
      <rect x="228" y="250" width="72" height="6" rx="3" fill="#3b82f6" />
      <text x="228" y="270" fontSize="7" fill="#94a3b8">Protein</text>
      <text x="332" y="270" fontSize="7" fill="#94a3b8" textAnchor="end">72%</text>

      <rect x="228" y="278" width="104" height="6" rx="3" fill="#e2e8f0" />
      <rect x="228" y="278" width="55" height="6" rx="3" fill="#f59e0b" />
      <text x="228" y="298" fontSize="7" fill="#94a3b8">Carbs</text>
      <text x="332" y="298" fontSize="7" fill="#94a3b8" textAnchor="end">53%</text>

      {/* Person — body */}
      <ellipse cx="150" cy="340" rx="55" ry="18" fill="#dcfce7" opacity="0.6" />
      {/* Legs */}
      <rect x="133" y="295" width="18" height="50" rx="9" fill="#fbbf24" />
      <rect x="155" y="295" width="18" height="50" rx="9" fill="#fbbf24" />
      {/* Shoes */}
      <ellipse cx="142" cy="344" rx="14" ry="7" fill="#1e293b" />
      <ellipse cx="164" cy="344" rx="14" ry="7" fill="#1e293b" />
      {/* Torso */}
      <rect x="120" y="215" width="60" height="85" rx="20" fill="#16a34a" />
      {/* Arm pointing at phone */}
      <path d="M180 240 Q220 230 210 200" stroke="#fbbf24" strokeWidth="18" strokeLinecap="round" fill="none" />
      {/* Hand */}
      <circle cx="210" cy="197" r="12" fill="#fbbf24" />
      {/* Other arm */}
      <path d="M120 240 Q100 260 108 290" stroke="#fbbf24" strokeWidth="18" strokeLinecap="round" fill="none" />
      {/* Head */}
      <circle cx="150" cy="195" r="32" fill="#fbbf24" />
      {/* Hair */}
      <path d="M120 185 Q118 162 150 160 Q182 162 180 185 Q168 170 150 172 Q132 170 120 185Z" fill="#1e293b" />
      {/* Eyes */}
      <circle cx="140" cy="193" r="3.5" fill="#1e293b" />
      <circle cx="160" cy="193" r="3.5" fill="#1e293b" />
      <circle cx="141" cy="192" r="1.2" fill="white" />
      <circle cx="161" cy="192" r="1.2" fill="white" />
      {/* Smile */}
      <path d="M141 203 Q150 210 159 203" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Floating food items */}
      {/* Apple */}
      <circle cx="80" cy="150" r="22" fill="#ef4444" />
      <path d="M80 130 Q85 120 90 125" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M80 130 Q74 122 78 118" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="74" cy="148" rx="4" ry="7" fill="#dc2626" opacity="0.3" />

      {/* Avocado */}
      <ellipse cx="410" cy="130" rx="20" ry="28" fill="#84cc16" />
      <ellipse cx="410" cy="135" rx="12" ry="18" fill="#65a30d" />
      <circle cx="410" cy="138" r="8" fill="#fef08a" />

      {/* Broccoli */}
      <rect x="365" y="255" width="8" height="22" rx="4" fill="#65a30d" />
      <circle cx="369" cy="252" r="10" fill="#16a34a" />
      <circle cx="359" cy="258" r="8" fill="#22c55e" />
      <circle cx="379" cy="258" r="8" fill="#22c55e" />

      {/* AI sparkles */}
      <g opacity="0.7">
        <path d="M420 80 L423 70 L426 80 L436 83 L426 86 L423 96 L420 86 L410 83Z" fill="#f59e0b" />
        <path d="M70 240 L72 233 L74 240 L81 242 L74 244 L72 251 L70 244 L63 242Z" fill="#3b82f6" />
        <path d="M440 200 L441.5 195 L443 200 L448 201.5 L443 203 L441.5 208 L440 203 L435 201.5Z" fill="#a855f7" />
      </g>
    </svg>
  );
}
