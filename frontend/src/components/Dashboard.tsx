'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Header from './Header';
import DisasterMap from './DisasterMap';
import FilterPanel from './FilterPanel';
import EventsList from './EventsList';
import StatsPanel from './StatsPanel';
import Footer from './Footer';
import { eventsApi, statsApi, type Event, type Stats } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const t = useTranslations();
  const locale = useLocale();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    country: '',
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        eventsApi.getEvents({
          type: filters.type || undefined,
          severity: filters.severity || undefined,
          country: filters.country || undefined,
          limit: 1000,
        }),
        statsApi.getStats(),
      ]);
      setEvents(eventsData.data);
      setStats(statsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('map.title')}
              </h1>
              {stats && (
                <p className="text-sm text-gray-600 mt-1">
                  {stats.total_events} {t('stats.totalEvents').toLowerCase()}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="map-view-btn"
              >
                {locale === 'ar' ? 'خريطة' : 'Map'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="list-view-btn"
              >
                {locale === 'ar' ? 'قائمة' : 'List'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Filters & Stats */}
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            {stats && <StatsPanel stats={stats} />}
          </aside>

          {/* Main View */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
              </div>
            ) : viewMode === 'map' ? (
              <DisasterMap
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={handleEventSelect}
              />
            ) : (
              <EventsList
                events={events}
                onEventSelect={handleEventSelect}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
