"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Globe } from "lucide-react";

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function LanguageToggle({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Set cookie
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    // Replace current locale in URL if it exists
    let newPath = pathname;
    const pathParts = pathname.split('/');
    if (languages.some(lang => lang.code === pathParts[1])) {
      pathParts[1] = newLocale;
      newPath = pathParts.join('/');
    } else {
      newPath = `/${newLocale}${pathname}`;
    }
    
    setIsOpen(false);
    router.push(newPath);
    router.refresh();
  };

  const current = languages.find(l => l.code === currentLocale) || languages[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-surface-100 ${
                  currentLocale === lang.code ? 'font-bold text-primary-600' : 'text-surface-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
