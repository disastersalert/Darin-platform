'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { Event } from '@/lib/api';
import { formatDate, formatNumber, getSeverityColor } from '@/lib/utils';
import { MapPin, Users, Skull } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export default function EventsList({ events, onEventSelect }: EventsListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0A0F1C]">
        <p className="text-[#9CA3AF]">{t('map.noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0A0F1C]" data-testid="events-list">
      <div className="p-4 space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-[#111827] border border-[#1F2937] p-4 hover:border-[#374151] hover:bg-[#1A1F2E] transition-all duration-100 cursor-pointer"
            onClick={() => onEventSelect(event)}
            data-testid={`event-card-${event.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#E5E7EB] mb-1">
                  {isArabic && event.title_ar ? event.title_ar : event.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.country || 'Unknown'}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider ${getSeverityColor(
                  event.severity
                )}`}
                data-testid={`event-severity-${event.id}`}
                style={{borderRadius: '2px'}}
              >
                {t(`severity.${event.severity}`)}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2.5">
              <span className="inline-flex items-center px-2.5 py-1 bg-[#1A1F2E] border border-[#1F2937] text-[10px] font-semibold text-[#38BDF8] uppercase tracking-wider">
                {t(`eventTypes.${event.type}`)}
              </span>
              <span className="text-xs text-[#6B7280] font-mono-tabular">
                {formatDate(event.start_date, locale)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              {event.affected_people && event.affected_people > 0 && (
                <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">{formatNumber(event.affected_people)}</span>
                </div>
              )}
              {event.casualties && event.casualties > 0 && (
                <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                  <Skull className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">{formatNumber(event.casualties)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
