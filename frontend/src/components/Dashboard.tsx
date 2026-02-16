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
      console.log('=== LOADING EVENTS FROM API ===');
      console.log('Filters:', filters);
      
      const [eventsData, statsData] = await Promise.all([
        eventsApi.getEvents({
          type: filters.type || undefined,
          severity: filters.severity || undefined,
          country: filters.country || undefined,
          limit: 1000,
        }),
        statsApi.getStats(),
      ]);
      
      console.log('Events API response:', eventsData);
      console.log('Events count:', eventsData.data.length);
      console.log('First event sample:', eventsData.data[0]);
      console.log('First event coordinates:', {
        lat: eventsData.data[0]?.latitude,
        lon: eventsData.data[0]?.longitude,
        latType: typeof eventsData.data[0]?.latitude,
        lonType: typeof eventsData.data[0]?.longitude
      });
      
      setEvents(eventsData.data);
      setStats(statsData.data);
      
      console.log('Events state updated with', eventsData.data.length, 'events');
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
    <div className="min-h-screen flex flex-col bg-[#0A0F1C]">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-[#111827] border-b border-[#1F2937] px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#E5E7EB] tracking-tight">
                {t('map.title')}
              </h1>
              {stats && (
                <p className="text-[10px] text-[#6B7280] mt-0.5 font-mono-tabular uppercase tracking-wider">
                  <span className="text-[#38BDF8] font-bold">{stats.total_events}</span> {t('stats.totalEvents').toLowerCase()}
                </p>
              )}
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-1.5 text-xs font-bold transition-all duration-100 smooth-transition ${
                  viewMode === 'map'
                    ? 'bg-[#1E3A8A] text-white glow-accent'
                    : 'bg-[#1A1F2E] text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1E2836] border border-[#1F2937]'
                }`}
                data-testid="map-view-btn"
              >
                {locale === 'ar' ? 'خريطة' : 'Map'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 text-xs font-bold transition-all duration-100 smooth-transition ${
                  viewMode === 'list'
                    ? 'bg-[#1E3A8A] text-white glow-accent'
                    : 'bg-[#1A1F2E] text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1E2836] border border-[#1F2937]'
                }`}
                data-testid="list-view-btn"
              >
                {locale === 'ar' ? 'قائمة' : 'List'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - 65% map layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Compact */}
          <aside className="w-72 bg-[#111827] border-r border-[#1F2937] overflow-y-auto">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            {stats && <StatsPanel stats={stats} />}
          </aside>

          {/* Main View - Map dominance */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1C]">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#38BDF8] mx-auto marker-glow" />
                  <p className="mt-3 text-sm text-[#9CA3AF]">{t('common.loading')}</p>
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
