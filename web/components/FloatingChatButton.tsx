'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Floating chat bubble — visible on all app pages except landing and the chat page itself. */
export function FloatingChatButton() {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/chat') return null;

  return (
    <Link
      href="/chat"
      aria-label="Open AI nutrition coach"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50
        w-14 h-14 rounded-full bg-green-600 text-white
        flex items-center justify-center
        shadow-[0_4px_20px_rgba(22,163,74,0.45)]
        hover:bg-green-700 hover:scale-105 active:scale-95
        transition-all duration-150
        outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {/* pulse ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 pointer-events-none" aria-hidden="true" />
    </Link>
  );
}
