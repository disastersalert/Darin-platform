'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { DISASTER_TYPES, SEVERITY_LEVELS } from '@/lib/constants';

interface FilterPanelProps {
  filters: {
    type: string;
    severity: string;
    country: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const handleChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFilterChange({ type: '', severity: '', country: '' });
  };

  const hasFilters = filters.type || filters.severity || filters.country;

  return (
    <div className="p-4 border-b border-[#2A3441]" data-testid="filter-panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            {t('filters.title')}
          </h2>
        </div>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
            data-testid="clear-filters-btn"
          >
            {t('filters.clear')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Disaster Type Filter */}
        <div>
          <label className="stat-label block mb-1.5">
            {t('filters.type')}
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#1A2030] border border-[#2A3441] text-gray-300 text-sm focus:border-[#3B82F6] focus:outline-none transition-colors"
            data-testid="filter-type-select"
          >
            <option value="">{t('filters.allTypes')}</option>
            {DISASTER_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {isArabic ? type.labelAr : type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="stat-label block mb-1.5">
            {t('filters.severity')}
          </label>
          <select
            value={filters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#1A2030] border border-[#2A3441] text-gray-300 text-sm focus:border-[#3B82F6] focus:outline-none transition-colors"
            data-testid="filter-severity-select"
          >
            <option value="">{t('filters.allSeverities')}</option>
            {SEVERITY_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {isArabic ? level.labelAr : level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <label className="stat-label block mb-1.5">
            {t('filters.country')}
          </label>
          <input
            type="text"
            value={filters.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder={isArabic ? 'ابحث عن دولة...' : 'Search country...'}
            className="w-full px-2.5 py-1.5 bg-[#1A2030] border border-[#2A3441] text-gray-300 text-sm placeholder-gray-600 focus:border-[#3B82F6] focus:outline-none transition-colors"
            data-testid="filter-country-input"
          />
        </div>
      </div>
    </div>
  );
}
