import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-surface-500">
        <div className="relative w-32 h-32 animate-pulse-slow">
          <Image
            src="/logo.png"
            alt="Sridha's Store Loading"
            fill
            sizes="128px"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-surface-600 tracking-wide uppercase">Preparing your experience...</p>
        </div>
      </div>
    </div>
  );
}
