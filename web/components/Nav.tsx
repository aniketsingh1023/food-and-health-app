/**
 * Bottom navigation bar (mobile) + sidebar (desktop).
 * Accessible with keyboard navigation and ARIA landmarks.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/log', label: 'Log Food', icon: '➕' },
  { href: '/suggest', label: 'Suggestions', icon: '✨' },
  { href: '/habits', label: 'Habits', icon: '🎯' },
  { href: '/insights', label: 'Insights', icon: '📊' },
] as const;

/**
 * Renders responsive navigation:
 * - Bottom bar on mobile (max-md)
 * - Sidebar on desktop (md+)
 */
export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-pb"
        aria-label="Main navigation"
      >
        <ul className="flex items-center justify-around px-2 py-2" role="list">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                    transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF]
                    ${isActive ? 'text-[#00B894]' : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  <span className="text-xl" role="img" aria-hidden="true">{item.icon}</span>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-[#00B894]' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-slate-100 z-50 py-8 px-4"
        aria-label="Main navigation"
      >
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-slate-700">
            <span aria-hidden="true">🥗 </span>NutriAI
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Smart food intelligence</p>
        </div>

        <ul className="flex flex-col gap-1 flex-1" role="list">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF]
                    ${isActive
                      ? 'bg-[#A8E6CF]/20 text-[#00B894]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                  `}
                >
                  <span className="text-lg" role="img" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
