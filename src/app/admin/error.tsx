"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("[Admin Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center bg-surface-50 p-6 text-center">
      <div className="flex flex-col items-center max-w-md rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-surface-950">Something went wrong!</h2>
        <p className="mb-8 text-sm text-surface-500">
          We encountered an unexpected error while loading this admin view. Our engineering team has been notified.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => reset()} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
