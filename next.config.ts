import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is needed for Next.js's own inline bootstrap scripts and
  // next/script's inline GA snippet (components/GoogleAnalytics.tsx); the app
  // has no dangerouslySetInnerHTML/eval, so this isn't opening up a raw-HTML
  // injection vector. 'unsafe-eval' is dev-only, for Turbopack/HMR.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com`,
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com" + (isDev ? ' ws://localhost:* http://localhost:*' : ''),
  "img-src 'self' https://*.supabase.co data:",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
};

export default nextConfig;
