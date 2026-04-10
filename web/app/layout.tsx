import type { Metadata, Viewport } from 'next';
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
  description: 'AI-powered food tracking and health insights. Log meals, track habits, get personalised suggestions powered by Gemini.',
  applicationName: 'NutriAI',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex bg-[#f8fafc]">
        <Nav />
        <div className="flex-1 md:ml-52 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
