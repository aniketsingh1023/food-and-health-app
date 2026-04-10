'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">NutriAI</h1>
          <p className="text-sm text-slate-500 mt-0.5">Food Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-7" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                mode === 'signin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                mode === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'signin' ? 'Welcome back' : 'Get started free'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to your NutriAI account.'
                : 'Create your account and start tracking.'}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <GoogleLogo />
            )}
            {loading ? 'Redirecting...' : `Continue with Google`}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by Gemini AI · Your data stays private.
        </p>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
