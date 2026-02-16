'use client';

import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <header className="bg-[#0B0F19] border-b border-[#2A3441] shadow-lg" data-testid="header">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className="relative w-10 h-10">
              <Image
                src="/darin-logo.png"
                alt="DARIN Intelligence Platform"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className={isArabic ? 'text-right' : ''}>
              <h1 className="text-xl font-bold tracking-tight text-gray-100">
                {isArabic ? 'دارين' : 'DARIN'}
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                {isArabic
                  ? 'شبكة معلومات الكوارث والمخاطر'
                  : 'Intelligence Platform'}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1 bg-[#131826] rounded border border-[#2A3441] p-0.5">
              <Link
                href="/en"
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 ${
                  locale === 'en'
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-[#1A2030]'
                }`}
                data-testid="lang-en-btn"
              >
                EN
              </Link>
              <Link
                href="/ar"
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 ${
                  locale === 'ar'
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-[#1A2030]'
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
