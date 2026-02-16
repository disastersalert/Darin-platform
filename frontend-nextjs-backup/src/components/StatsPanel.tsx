'use client';

import { useTranslations, useLocale } from 'next-intl';
import { BarChart3, AlertTriangle, Globe } from 'lucide-react';
import type { Stats } from '@/lib/api';
import { getSeverityColor } from '@/lib/utils';

interface StatsPanelProps {
  stats: Stats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="p-6 space-y-6" data-testid="stats-panel">
      {/* Total Events */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-6 h-6" />
          <h3 className="text-sm font-medium opacity-90">
            {t('stats.totalEvents')}
          </h3>
        </div>
        <p className="text-4xl font-bold" data-testid="total-events-count">
          {stats.total_events}
        </p>
      </div>

      {/* By Severity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            {t('stats.bySeverity')}
          </h3>
        </div>
        <div className="space-y-2">
          {stats.by_severity.map((item) => (
            <div key={item.severity} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getSeverityColor(item.severity)}`} />
              <span className="text-sm text-gray-600 flex-1 capitalize">
                {t(`severity.${item.severity}`)}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By Type */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            {t('stats.byType')}
          </h3>
        </div>
        <div className="space-y-2">
          {stats.by_type.slice(0, 5).map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t(`eventTypes.${item.type}`)}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By Country */}
      {stats.by_country.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t('stats.byCountry')}
          </h3>
          <div className="space-y-2">
            {stats.by_country.slice(0, 5).map((item) => (
              <div key={item.country} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.country}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
