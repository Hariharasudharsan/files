export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-orange-800/70 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display font-semibold text-orange-950">
            Mathuram Foods — Vadam &amp; Vathal Unit
          </p>
          <p>© {new Date().getFullYear()} Mathuram Foods. All rights reserved.</p>
        </div>
        <p className="mt-4 text-center text-xs text-orange-700/50 sm:text-left">
          Authentic, factory-direct papadam, vadam, appalam and vathal — traditionally made,
          freshly packed, delivered across India.
        </p>
      </div>
    </footer>
  );
}
