'use client';

import { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Event } from '@/lib/api';
import { getMarkerColor, formatNumber, formatDate } from '@/lib/utils';

interface DisasterMapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
}

export default function DisasterMap({
  events,
  selectedEvent,
  onEventSelect,
}: DisasterMapProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapRef.current) {
        // Initialize map
        const map = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
          attributionControl: true,
        });

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      console.log('=== DARIN MAP DEBUG ===');
      console.log('Total events received:', events.length);
      console.log('Events data:', events);

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      let markersAdded = 0;
      events.forEach((event, index) => {
        console.log(`Event ${index}:`, {
          id: event.id,
          title: event.title,
          lat: event.latitude,
          lon: event.longitude,
          hasLat: !!event.latitude,
          hasLon: !!event.longitude,
        });

        if (!event.latitude || !event.longitude) {
          console.warn(`Event ${event.id} missing coordinates`);
          return;
        }

        const color = getMarkerColor(event.severity);
        console.log(`Creating marker for ${event.id} at [${event.latitude}, ${event.longitude}] with color ${color}`);

        // Create custom icon
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        try {
          const marker = L.marker([event.latitude, event.longitude], { icon })
            .addTo(mapInstanceRef.current);
          
          markersAdded++;
          console.log(`✓ Marker ${markersAdded} added successfully for ${event.id}`);

          // Create popup content
        const popupContent = `
          <div style="min-width: 250px; font-family: system-ui, sans-serif;">
            <div style="background: ${color}; color: white; padding: 8px 12px; margin: -10px -10px 10px; border-radius: 4px 4px 0 0;">
              <div style="font-size: 11px; opacity: 0.9; text-transform: uppercase; margin-bottom: 2px;">
                ${t(`severity.${event.severity}`)}
              </div>
              <div style="font-weight: 600; font-size: 14px;">
                ${isArabic && event.title_ar ? event.title_ar : event.title}
              </div>
            </div>
            
            <div style="padding: 4px 0;">
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; margin-bottom: 2px;">
                  ${t('event.type')}
                </div>
                <div style="font-size: 13px; color: #1F2937; font-weight: 500;">
                  ${t(`eventTypes.${event.type}`)}
                </div>
              </div>
              
              ${event.country ? `
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; margin-bottom: 2px;">
                    ${t('event.country')}
                  </div>
                  <div style="font-size: 13px; color: #1F2937; font-weight: 500;">
                    ${event.country}
                  </div>
                </div>
              ` : ''}
              
              ${event.affected_people && event.affected_people > 0 ? `
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; margin-bottom: 2px;">
                    ${t('event.affectedPeople')}
                  </div>
                  <div style="font-size: 13px; color: #1F2937; font-weight: 500;">
                    ${formatNumber(event.affected_people)}
                  </div>
                </div>
              ` : ''}
              
              <div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; margin-bottom: 2px;">
                  ${t('event.startDate')}
                </div>
                <div style="font-size: 13px; color: #1F2937; font-weight: 500;">
                  ${formatDate(event.start_date, locale)}
                </div>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup',
        });

          marker.on('click', () => {
            onEventSelect(event);
          });

          markersRef.current.push(marker);
        } catch (error) {
          console.error(`Error adding marker for ${event.id}:`, error);
        }
      });

      console.log(`Total markers added to map: ${markersAdded}/${events.length}`);

      // Fit bounds if there are events
      if (events.length > 0) {
        const bounds = events
          .filter((e) => e.latitude && e.longitude)
          .map((e) => [e.latitude, e.longitude] as [number, number]);
        
        console.log('Bounds to fit:', bounds);
        
        if (bounds.length > 0) {
          try {
            mapInstanceRef.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 6,
            });
            console.log('Map bounds fitted successfully');
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        }
      }
      
      console.log('=== END MAP DEBUG ===');
    };

    updateMarkers();
  }, [events, t, locale, isArabic, onEventSelect]);

  return (
    <div className="w-full h-full relative" data-testid="disaster-map">
      <div ref={mapRef} className="w-full h-full map-container" />
      {events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <p className="text-gray-500">{t('map.noEvents')}</p>
        </div>
      )}
    </div>
  );
}
