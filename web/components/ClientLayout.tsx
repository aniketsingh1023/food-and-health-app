'use client';

import { usePathname } from 'next/navigation';

/**
 * Applies the sidebar offset only on non-landing pages
 * so the landing page renders full-width.
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  return (
    <div className={`flex-1 flex flex-col min-h-screen${isLanding ? '' : ' md:ml-52'}`}>
      {children}
    </div>
  );
}
