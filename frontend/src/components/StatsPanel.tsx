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
    <div className="p-3 space-y-3" data-testid="stats-panel">
      {/* Total Events - Enhanced with gradient */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] border border-[#1F2937] p-3 glow-accent">
        <div className="flex items-center gap-2 mb-1.5">
          <Globe className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="stat-label text-[#E5E7EB]">
            {t('stats.totalEvents')}
          </h3>
        </div>
        <p className="stat-value text-white" data-testid="total-events-count">
          {stats.total_events}
        </p>
      </div>

      {/* By Severity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-[#6B7280]" />
          <h3 className="stat-label text-[#9CA3AF]">
            {t('stats.bySeverity')}
          </h3>
        </div>
        <div className="space-y-1">
          {stats.by_severity.map((item) => (
            <div key={item.severity} className="flex items-center gap-2 px-2 py-1.5 bg-[#1A1F2E] border border-[#1F2937] smooth-transition hover:border-[#374151]">
              <div className={`w-2 h-2 ${getSeverityColor(item.severity)}`} style={{borderRadius: '2px'}} />
              <span className="text-[10px] text-[#9CA3AF] flex-1 uppercase tracking-widest font-semibold">
                {t(`severity.${item.severity}`)}
              </span>
              <span className="text-xs font-bold text-[#E5E7EB] font-mono-tabular">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By Type */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-[#6B7280]" />
          <h3 className="stat-label text-[#9CA3AF]">
            {t('stats.byType')}
          </h3>
        </div>
        <div className="space-y-1">
          {stats.by_type.slice(0, 5).map((item) => (
            <div key={item.type} className="flex items-center justify-between px-2 py-1 bg-[#1A1F2E] smooth-transition hover:bg-[#1E2836]">
              <span className="text-xs text-[#9CA3AF]">
                {t(`eventTypes.${item.type}`)}
              </span>
              <span className="text-xs font-bold text-[#E5E7EB] font-mono-tabular">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* By Country */}
      {stats.by_country.length > 0 && (
        <div>
          <h3 className="stat-label mb-2 text-[#9CA3AF]">
            {t('stats.byCountry')}
          </h3>
          <div className="space-y-1">
            {stats.by_country.slice(0, 5).map((item) => (
              <div key={item.country} className="flex items-center justify-between px-2 py-1 bg-[#1A1F2E] smooth-transition hover:bg-[#1E2836]">
                <span className="text-xs text-[#9CA3AF] truncate">{item.country}</span>
                <span className="text-xs font-bold text-[#E5E7EB] font-mono-tabular ml-2">
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
