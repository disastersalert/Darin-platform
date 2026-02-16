'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-[#0B0F19] border-t border-[#2A3441] py-4" data-testid="footer">
      <div className="px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Data Source: GDACS
          </div>
          
          <div className="flex gap-4 text-xs">
            <a
              href="https://x.com/DisastersAlert"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              data-testid="x-link"
            >
              X (formerly Twitter)
            </a>
            <a
              href="mailto:Disasters@mail.com"
              className="text-gray-500 hover:text-gray-300 transition-colors"
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
