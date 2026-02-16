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
    <div className="p-4 space-y-4" data-testid="stats-panel">
      {/* Total Events */}
      <div className="bg-[#1A2030] border border-[#2A3441] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <h3 className="stat-label">
            {t('stats.totalEvents')}
          </h3>
        </div>
        <p className="stat-value text-[#3B82F6]" data-testid="total-events-count">
          {stats.total_events}
        </p>
      </div>

      {/* By Severity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <h3 className="stat-label">
            {t('stats.bySeverity')}
          </h3>
        </div>
        <div className="space-y-1.5">
          {stats.by_severity.map((item) => (
            <div key={item.severity} className="flex items-center gap-2 px-2 py-1.5 bg-[#1A2030] border border-[#2A3441]">
              <div className={`w-2 h-2 rounded-sm ${getSeverityColor(item.severity)}`} />
              <span className="text-xs text-gray-400 flex-1 uppercase tracking-wide">
                {t(`severity.${item.severity}`)}
              </span>
              <span className="text-xs font-semibold text-gray-300 font-mono-tabular">
                {item.count}
              </span>
            </div>
          ))}</div>
      </div>

      {/* By Type */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <h3 className="stat-label">
            {t('stats.byType')}
          </h3>
        </div>
        <div className="space-y-1.5">
          {stats.by_type.slice(0, 5).map((item) => (
            <div key={item.type} className="flex items-center justify-between px-2 py-1 bg-[#1A2030]">
              <span className="text-xs text-gray-400">
                {t(`eventTypes.${item.type}`)}
              </span>
              <span className="text-xs font-semibold text-gray-300 font-mono-tabular">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By Country */}
      {stats.by_country.length > 0 && (
        <div>
          <h3 className="stat-label mb-2">
            {t('stats.byCountry')}
          </h3>
          <div className="space-y-1.5">
            {stats.by_country.slice(0, 5).map((item) => (
              <div key={item.country} className="flex items-center justify-between px-2 py-1 bg-[#1A2030]">
                <span className="text-xs text-gray-400 truncate">{item.country}</span>
                <span className="text-xs font-semibold text-gray-300 font-mono-tabular ml-2">
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
