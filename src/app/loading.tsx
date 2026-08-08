import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-surface-500">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        <p className="text-sm font-medium animate-pulse text-surface-600">Preparing your experience...</p>
      </div>
    </div>
  );
}
