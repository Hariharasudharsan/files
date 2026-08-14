'use client';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';
import './globals.css';

import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('CRITICAL GLOBAL ERROR:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased text-surface-900 bg-surface-50">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/50">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950">
            Critical System Error
          </h1>
          <p className="mt-4 max-w-md text-lg text-surface-600">
            The application encountered an unrecoverable error. Please try reloading the page.
          </p>
          
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={() => reset()}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload Application
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-xl border border-surface-200 bg-white px-6 py-3 font-semibold text-surface-900 shadow-sm transition-all hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
