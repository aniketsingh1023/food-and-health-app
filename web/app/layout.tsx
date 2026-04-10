import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Nav } from '@/components/Nav';
import { ClientLayout } from '@/components/ClientLayout';
import { FloatingChatButton } from '@/components/FloatingChatButton';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
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
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex bg-[#f8fafc]">
        <AuthProvider>
          <Nav />
          <ClientLayout>
            {children}
          </ClientLayout>
          <FloatingChatButton />
        </AuthProvider>
      </body>
    </html>
  );
}
