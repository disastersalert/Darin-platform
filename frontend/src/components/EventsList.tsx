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
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-gray-500">{t('map.noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50" data-testid="events-list">
      <div className="p-6 space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEventSelect(event)}
            data-testid={`event-card-${event.id}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {isArabic && event.title_ar ? event.title_ar : event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.country || 'Unknown'}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(
                  event.severity
                )}`}
                data-testid={`event-severity-${event.id}`}
              >
                {t(`severity.${event.severity}`)}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t(`eventTypes.${event.type}`)}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(event.start_date, locale)}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              {event.affected_people && event.affected_people > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(event.affected_people)}</span>
                </div>
              )}
              {event.casualties && event.casualties > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Skull className="w-4 h-4" />
                  <span>{formatNumber(event.casualties)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
