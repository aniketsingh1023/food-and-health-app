import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NutriAI — Smart Food Intelligence',
  description: 'AI-powered food tracking and health insights. Log meals, track habits, get personalized suggestions.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex bg-[#F8FAFB]">
        <Nav />
        {/* Desktop content offset for sidebar */}
        <div className="flex-1 md:ml-56 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
