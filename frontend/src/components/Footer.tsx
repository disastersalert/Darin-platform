'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-[#0A0F1C] border-t border-[#1F2937] py-3" data-testid="footer">
      <div className="px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">
            Data Source: GDACS
          </div>
          
          <div className="flex gap-4 text-xs">
            <a
              href="https://x.com/DisastersAlert"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9CA3AF] hover:text-[#38BDF8] transition-colors"
              data-testid="x-link"
            >
              X
            </a>
            <a
              href="mailto:Disasters@mail.com"
              className="text-[#9CA3AF] hover:text-[#38BDF8] transition-colors"
              data-testid="contact-link"
            >
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
