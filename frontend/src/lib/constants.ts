export interface DisasterType {
  id: string;
  label: string;
  labelAr: string;
}

export const DISASTER_TYPES: DisasterType[] = [
  { id: 'Earthquake', label: 'Earthquake', labelAr: 'زلزال' },
  { id: 'Tropical Cyclone', label: 'Tropical Cyclone', labelAr: 'إعصار استوائي' },
  { id: 'Flood', label: 'Flood', labelAr: 'فيضان' },
  { id: 'Volcano', label: 'Volcano', labelAr: 'بركان' },
  { id: 'Drought', label: 'Drought', labelAr: 'جفاف' },
  { id: 'Wildfire', label: 'Wildfire', labelAr: 'حريق غابات' },
  { id: 'Tsunami', label: 'Tsunami', labelAr: 'تسونامي' },
];

export const SEVERITY_LEVELS = [
  { id: 'critical', label: 'Critical', labelAr: 'حرج' },
  { id: 'high', label: 'High', labelAr: 'عالي' },
  { id: 'medium', label: 'Medium', labelAr: 'متوسط' },
  { id: 'low', label: 'Low', labelAr: 'منخفض' },
];
