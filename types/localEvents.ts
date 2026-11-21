export type LocalEventCategory =
  | 'Music'
  | 'Culture'
  | 'Theatre'
  | 'Sport'
  | 'Panonnica';

export const ALLOWED_EVENT_CATEGORIES: LocalEventCategory[] = [
  'Music',
  'Culture',
  'Theatre',
  'Sport',
  'Panonnica'
];

export interface LocalEvent {
  id: string;
  title: string;
  category: LocalEventCategory;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  venue_name: string;
  city: string; // "Tuzla"
  price: string | null;
  source_urls?: string[];
  verification_sources?: string[];
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}
