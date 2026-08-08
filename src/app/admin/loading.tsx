import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-4 text-surface-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm font-medium animate-pulse">Loading dashboard data...</p>
      </div>
    </div>
  );
}
