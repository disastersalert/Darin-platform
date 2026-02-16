'use client';

import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <header className="bg-[#0A0F1C] border-b border-[#1F2937] shadow-lg" data-testid="header">
      <div className="px-6 py-2.5">
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
              <h1 className="text-xl font-bold tracking-tight text-[#E5E7EB]">
                {isArabic ? 'دارين' : 'DARIN'}
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-[#6B7280] font-semibold">
                {isArabic
                  ? 'شبكة معلومات الكوارث والمخاطر'
                  : 'Intelligence Platform'}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#6B7280]" />
            <div className="flex gap-0.5 bg-[#111827] rounded border border-[#1F2937] p-0.5">
              <Link
                href="/en"
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-100 ${
                  locale === 'en'
                    ? 'bg-[#1E3A8A] text-white glow-accent'
                    : 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1A1F2E]'
                }`}
                data-testid="lang-en-btn"
              >
                EN
              </Link>
              <Link
                href="/ar"
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-100 ${
                  locale === 'ar'
                    ? 'bg-[#1E3A8A] text-white glow-accent'
                    : 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1A1F2E]'
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
