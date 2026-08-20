'use client';
import { Logger } from "@/lib/infrastructure/logger";

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

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
    Logger.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/50">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950">
        Something went wrong!
      </h1>
      <p className="mt-4 max-w-md text-lg text-surface-600">
        We&apos;re sorry, but an unexpected error occurred. Our engineering team has been notified.
      </p>
      
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-surface-950 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-surface-200 bg-white px-6 py-3 font-semibold text-surface-900 shadow-sm transition-all hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2"
        >
          Return Home
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 w-full max-w-2xl rounded-xl bg-surface-950 p-6 text-left shadow-lg">
          <p className="font-mono text-sm font-semibold text-red-400">Developer Stack Trace:</p>
          <pre className="mt-2 overflow-x-auto text-xs text-surface-300">
            {error.stack || error.message}
          </pre>
        </div>
      )}
    </div>
  );
}
