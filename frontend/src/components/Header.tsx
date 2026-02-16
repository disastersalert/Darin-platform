'use client';

import { useLocale } from 'next-intl';
import { Globe, Languages } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <header className="bg-primary text-white shadow-lg" data-testid="header">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isArabic ? 'دارين' : 'DARIN'}
              </h1>
              <p className="text-sm text-blue-100">
                {isArabic
                  ? 'شبكة معلومات الكوارث والمخاطر'
                  : 'Disaster and Risk Information Network'}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            <div className="flex gap-1 bg-primary-dark rounded-lg p-1">
              <Link
                href="/en"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-accent text-white'
                    : 'text-blue-100 hover:bg-primary-dark/50'
                }`}
                data-testid="lang-en-btn"
              >
                EN
              </Link>
              <Link
                href="/ar"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  locale === 'ar'
                    ? 'bg-accent text-white'
                    : 'text-blue-100 hover:bg-primary-dark/50'
                }`}
                data-testid="lang-ar-btn"
              >
                AR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
