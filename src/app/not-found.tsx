import Link from "next/link";
import { Search, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 text-center bg-surface-50">
      <div className="mb-8">
        <h1 className="text-9xl font-display font-bold text-primary-200 tracking-tighter">404</h1>
      </div>
      <h2 className="text-3xl font-display font-bold text-surface-950 tracking-tight sm:text-4xl mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-surface-600 max-w-lg mx-auto mb-10">
        We couldn&apos;t find the page you&apos;re looking for. The recipe might have changed, or the product has been moved to a new collection.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-6 text-lg">
            <Home className="w-5 h-5" /> Back to Store
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-6 text-lg border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300">
            <Search className="w-5 h-5" /> Search Products
          </Button>
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-surface-200 w-full max-w-md mx-auto">
        <p className="text-sm font-semibold text-surface-500 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" /> Lost? Reach out to support@mathuram.com
        </p>
      </div>
    </div>
  );
}
