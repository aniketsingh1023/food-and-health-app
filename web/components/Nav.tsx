'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard'   },
  { href: '/log',       label: 'Log Food'    },
  { href: '/suggest',   label: 'Suggestions' },
  { href: '/habits',    label: 'Habits'      },
  { href: '/insights',  label: 'Insights'    },
  { href: '/goals',     label: 'My Goals'    },
] as const;

export function Nav() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  if (isLanding) return null;

  return (
    <>
      {/* ── Mobile bottom bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
        aria-label="Main navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <ul className="flex items-center justify-around px-1 py-2">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-600 ${
                    active ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <NavIcon href={item.href} active={active} />
                  {item.label.split(' ')[0]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Desktop sidebar ── */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-52 bg-white border-r border-slate-200 z-50"
        aria-label="Main navigation"
      >
        <div className="px-5 py-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">NutriAI</p>
              <p className="text-[10px] text-slate-400 leading-none">Food Intelligence</p>
            </div>
          </Link>
        </div>

        <ul className="flex flex-col gap-0.5 p-3 flex-1" role="list">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-green-600 transition-colors ${
                    active ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <NavIcon href={item.href} active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">Powered by Gemini AI</p>
        </div>
      </nav>
    </>
  );
}

function NavIcon({ href, active }: { href: string; active: boolean }) {
  const c = active ? '#16a34a' : '#94a3b8';
  const icons: Record<string, React.ReactNode> = {
    '/dashboard': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    '/log': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    '/suggest': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    '/habits': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    '/insights': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    '/goals': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  };
  return <>{icons[href] ?? null}</>;
}
