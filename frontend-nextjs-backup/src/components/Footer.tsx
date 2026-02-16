'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 border-t border-gray-800" data-testid="footer">
      <div className="px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            {t('footer.dataSource')}
          </div>
          
          <div className="flex gap-6">
            <a
              href="https://twitter.com/DisastersAlert"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              data-testid="twitter-link"
            >
              {t('footer.twitter')}
            </a>
            <a
              href="mailto:Disasters@mail.com"
              className="hover:text-white transition-colors"
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
