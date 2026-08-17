export interface StructuredEvent {
  title: string;
  category: 'Sports' | 'Concerts & Music' | 'Culture & Theatre' | 'Nightlife' | 'Exhibitions & Art' | 'Community & Workshops' | 'Other';
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  is_time_uncertain: boolean;
  venue_name: string;
  address_or_area: string;
  city: string;
  description: string;
  ticket_info: string | null;
  organizer: string | null;
  tags: string[];
}

export interface EventExtractionResult {
  is_valid_event: boolean;
  confidence_score: number;
  rejection_reason: string | null;
  event: StructuredEvent | null;
}

export interface CalendarEventItem extends StructuredEvent {
  id: string;
  created_at?: string;
  source_portal?: string;
}
