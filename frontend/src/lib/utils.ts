import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | undefined): string {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: string | undefined, locale: string = 'en'): string {
  if (!date) return '-';
  const d = new Date(date);
  
  // Force Gregorian calendar for both languages
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory', // Explicitly use Gregorian calendar
  });
}

export function getSeverityColor(severity: string): string {
  const colors = {
    critical: 'bg-severity-critical',
    high: 'bg-severity-high',
    medium: 'bg-severity-medium',
    low: 'bg-severity-low',
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-500';
}

export function getMarkerColor(severity: string): string {
  const colors = {
    critical: '#EF4444',
    high: '#F59E0B',
    medium: '#10B981',
    low: '#3B82F6',
  };
  return colors[severity as keyof typeof colors] || '#6B7280';
}
