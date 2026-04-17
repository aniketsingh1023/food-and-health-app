import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    // Restrict access to sensitive browser features not needed by this app
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline for its runtime style injection
      "style-src 'self' 'unsafe-inline'",
      // Next.js hydration scripts require unsafe-inline + unsafe-eval in dev;
      // nonces are the right long-term fix but require middleware changes.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Gemini API calls originate server-side, not the browser — no connect-src needed
      "img-src 'self' data:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  // Suppress the "X-Powered-By: Next.js" response header
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
