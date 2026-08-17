import { EventExtractionResult, CalendarEventItem } from '../types/events';

export const INITIAL_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: 'evt-2026-001',
    title: 'FK Sloboda vs FK Sarajevo',
    category: 'Sports',
    start_date: '2026-08-18',
    start_time: '19:00',
    is_time_uncertain: false,
    venue_name: 'Stadion Tušanj',
    address_or_area: 'Tušanj',
    city: 'Tuzla',
    description: 'Veliki derbi Wwin Lige BiH na stadionu Tušanj. Podržite crveno-crne u borbi za vrh tabele!',
    ticket_info: '5 KM - 10 KM',
    organizer: 'FK Sloboda Tuzla',
    tags: ['fudbal', 'Sloboda', 'Sarajevo', 'Tušanj', 'Wwin Liga'],
    source_portal: 'tuzlanski.ba'
  },
  {
    id: 'evt-2026-002',
    title: 'Koncert: Ljetna Noć pod Zvijezdama',
    category: 'Concerts & Music',
    start_date: '2026-08-22',
    start_time: '21:00',
    is_time_uncertain: false,
    venue_name: 'Trg slobode',
    address_or_area: 'Centar',
    city: 'Tuzla',
    description: 'Muzički spektakl na najvećem trgu u BiH. Nastupaju lokalni bendovi i gosti iznenađenja uz otvoreno nebo.',
    ticket_info: 'Besplatan ulaz',
    organizer: 'Grad Tuzla & Turistička zajednica',
    tags: ['koncert', 'muzika', 'Trg slobode', 'ljeto'],
    source_portal: 'tuzlainfo.ba'
  },
  {
    id: 'evt-2026-003',
    title: 'Izložba: Tuzlansko Slikarsko Ljeto',
    category: 'Exhibitions & Art',
    start_date: '2026-09-05',
    start_time: '18:30',
    is_time_uncertain: false,
    venue_name: 'Atelje Ismet Mujezinović',
    address_or_area: 'Klosterska',
    city: 'Tuzla',
    description: 'Retrospktiva radova savremenih umjetnika inspirisanih solnom historijom i duhom grada Tuzle.',
    ticket_info: 'Besplatan ulaz',
    organizer: 'JU Centar za kulturu Tuzla',
    tags: ['izložba', 'art', 'Ismet Mujezinović', 'kultura'],
    source_portal: 'bkctuzla.ba'
  },
  {
    id: 'evt-2026-004',
    title: 'Kino pod Zvijezdama: Tuzla Film Night',
    category: 'Culture & Theatre',
    start_date: '2026-09-12',
    start_time: '20:00',
    is_time_uncertain: false,
    venue_name: 'Panonska jezera - Ljetna bašta',
    address_or_area: 'Panonica',
    city: 'Tuzla',
    description: 'Projekcija nagrađivanog regionalnog igranog filma uz ambijentalno svjetlo slanih jezera.',
    ticket_info: '4 KM',
    organizer: 'Panonica Film Fest',
    tags: ['film', 'kino', 'Panonica', 'zabava'],
    source_portal: 'tip.ba'
  },
  {
    id: 'evt-2026-005',
    title: 'OKK Sloboda vs KK Bosna',
    category: 'Sports',
    start_date: '2026-10-15',
    start_time: '18:00',
    is_time_uncertain: false,
    venue_name: 'SKPC Mejdan',
    address_or_area: 'Mejdan',
    city: 'Tuzla',
    description: 'Košarkaški klasiks u velikoj dvorani SKPC Mejdan. Očekuje se paklena atmosfera u tuzlanskom hramu košarke.',
    ticket_info: '5 KM',
    organizer: 'OKK Sloboda',
    tags: ['košarka', 'Mejdan', 'Sloboda', 'sport'],
    source_portal: 'tuzlanski.ba'
  },
  {
    id: 'evt-2026-006',
    title: 'Balkan Tech Night & DJ Showcase',
    category: 'Nightlife',
    start_date: '2026-10-31',
    start_time: '22:30',
    is_time_uncertain: false,
    venue_name: 'Club Palma / Dom Mladih',
    address_or_area: 'Centar',
    city: 'Tuzla',
    description: 'Elektronska muzička noć uz vrhunske regionalne DJ-eve i visual-art nastup.',
    ticket_info: '10 KM na ulazu',
    organizer: 'Underground Tuzla',
    tags: ['party', 'nightlife', 'Palma', 'DJ'],
    source_portal: 'tuzlainfo.ba'
  },
  {
    id: 'evt-2027-001',
    title: 'Tuzla Winter Fest 2027 & Novogodišnji Bazar',
    category: 'Community & Workshops',
    start_date: '2027-01-10',
    start_time: '12:00',
    is_time_uncertain: false,
    venue_name: 'Trg slobode',
    address_or_area: 'Centar',
    city: 'Tuzla',
    description: 'Zimski festival sa kućicama domaćih proizvoda, kuvanim vinom, radionicama za djecu i svirkom uživo.',
    ticket_info: 'Besplatan ulaz',
    organizer: 'Turistička zajednica Grada Tuzla',
    tags: ['winterfest', 'bazar', 'Trg slobode', 'zima', '2027'],
    source_portal: 'tuzla.ba'
  },
  {
    id: 'evt-2027-002',
    title: 'Proljetni Tuzlanski Polumaraton 2027',
    category: 'Sports',
    start_date: '2027-05-16',
    start_time: '09:00',
    is_time_uncertain: false,
    venue_name: 'Start: Trg slobode / Staza kroz grad',
    address_or_area: 'Tuzla Grad',
    city: 'Tuzla',
    description: 'Jubilarni polumaraton i trka zadovoljstva na 5km i 21km kroz najljepše ulice Tuzle.',
    ticket_info: 'Kotizacija 25 KM',
    organizer: 'Maraton Klub Tuzla',
    tags: ['trčanje', 'maraton', 'sport', '2027'],
    source_portal: 'tuzlanski.ba'
  }
];

export function extractEventFromText(rawText: string, defaultYear: number = 2026): EventExtractionResult {
  if (!rawText || rawText.trim().length < 15) {
    return {
      is_valid_event: false,
      confidence_score: 0.95,
      rejection_reason: 'Tekst je prekratak ili ne sadrži dovoljno informacija o događaju.',
      event: null
    };
  }

  const textLower = rawText.toLowerCase();

  // Basic geographic scope check
  const nonTuzlaCities = ['sarajevo', 'mostar', 'banja luka', 'zenica', 'zagreb', 'beograd'];
  const hasOtherCity = nonTuzlaCities.some(city => textLower.includes(city));
  const hasTuzlaRegion = ['tuzla', 'tuzli', 'tušanj', 'mejdan', 'bkc', 'panonica', 'panonska', 'lukavac', 'živinice', 'srebrenik', 'gračanica', 'slana banja', 'trg slobode', 'soni trg'].some(loc => textLower.includes(loc));

  if (hasOtherCity && !hasTuzlaRegion) {
    return {
      is_valid_event: false,
      confidence_score: 0.92,
      rejection_reason: 'Događaj se ne održava u Tuzli ili bližoj okolini.',
      event: null
    };
  }

  // Non-event keywords check (general news)
  const nonEventKeywords = ['renoviranje', 'radovi počinju', 'sredstva za', 'izbori', 'nesreća', 'policija', 'hapšenje', 'vremenska prognoza', 'budžet'];
  const isGeneralNews = nonEventKeywords.some(kw => textLower.includes(kw)) && !textLower.includes('utakmica') && !textLower.includes('koncert');
  
  if (isGeneralNews) {
    return {
      is_valid_event: false,
      confidence_score: 0.90,
      rejection_reason: 'Opšta vijest ili najava radova/vijest bez javnog događaja sa datumom i vremenom.',
      event: null
    };
  }

  // Datetime detection logic
  let startDate = `${defaultYear}-08-18`;
  let startTime = '19:00';
  let isTimeUncertain = true;

  // Check for explicit dates like 18.08., 25.09.2026
  const dateMatch = rawText.match(/(\d{1,2})\.(\d{1,2})\.?(?:(\d{4}))?/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3] ? dateMatch[3] : defaultYear.toString();
    startDate = `${year}-${month}-${day}`;
  } else if (textLower.includes('sutra')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDate = tomorrow.toISOString().split('T')[0];
  }

  // Check time like 19:00 or 19h or 19.00
  const timeMatch = rawText.match(/(\d{1,2})[:.](\d{2})/) || rawText.match(/od (\d{1,2})\s*(?:sati|h)?/i);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2] ? timeMatch[2] : '00';
    startTime = `${hours}:${minutes}`;
    isTimeUncertain = false;
  }

  // Category determination
  let category: CalendarEventItem['category'] = 'Other';
  if (textLower.includes('utakmica') || textLower.includes('fudbal') || textLower.includes('košarka') || textLower.includes('klub') || textLower.includes('fk ') || textLower.includes('okk ') || textLower.includes('liga')) {
    category = 'Sports';
  } else if (textLower.includes('koncert') || textLower.includes('muzika') || textLower.includes('nastup') || textLower.includes('bend') || textLower.includes('pjevač')) {
    category = 'Concerts & Music';
  } else if (textLower.includes('predstava') || textLower.includes('teatar') || textLower.includes('pozorište') || textLower.includes('film') || textLower.includes('projekcija')) {
    category = 'Culture & Theatre';
  } else if (textLower.includes('party') || textLower.includes('dj') || textLower.includes('žurka') || textLower.includes('klub') || textLower.includes('night')) {
    category = 'Nightlife';
  } else if (textLower.includes('izložba') || textLower.includes('galerija') || textLower.includes('slike') || textLower.includes('skulptur')) {
    category = 'Exhibitions & Art';
  } else if (textLower.includes('radionica') || textLower.includes('bazar') || textLower.includes('sajam') || textLower.includes('festival')) {
    category = 'Community & Workshops';
  }

  // Venue extraction
  let venueName = 'Tuzla';
  if (textLower.includes('tušanj')) venueName = 'Stadion Tušanj';
  else if (textLower.includes('mejdan')) venueName = 'SKPC Mejdan';
  else if (textLower.includes('bkc')) venueName = 'BKC Tuzla';
  else if (textLower.includes('trg slobode')) venueName = 'Trg slobode';
  else if (textLower.includes('soni trg')) venueName = 'Soni Trg';
  else if (textLower.includes('panonic') || textLower.includes('panonsk')) venueName = 'Panonska jezera';
  else if (textLower.includes('mujezinović')) venueName = 'Atelje Ismet Mujezinović';

  // Title & description cleanup
  const title = rawText.split('.')[0].substring(0, 60).trim() || 'Novi Tuzlanski Događaj';
  const description = rawText.trim();
  
  // Ticket info
  let ticketInfo = null;
  if (textLower.includes('besplatan ulaz') || textLower.includes('ulaz slobodan')) {
    ticketInfo = 'Besplatan ulaz';
  } else {
    const priceMatch = rawText.match(/(\d+\s*KM)/i);
    if (priceMatch) ticketInfo = priceMatch[1];
  }

  return {
    is_valid_event: true,
    confidence_score: 0.96,
    rejection_reason: null,
    event: {
      title,
      category,
      start_date: startDate,
      start_time: startTime,
      is_time_uncertain: isTimeUncertain,
      venue_name: venueName,
      address_or_area: venueName.includes('Tušanj') ? 'Tušanj' : 'Centar',
      city: 'Tuzla',
      description,
      ticket_info: ticketInfo,
      organizer: textLower.includes('sloboda') ? 'FK/OKK Sloboda' : 'Organizator Tuzla',
      tags: ['tuzla', category.toLowerCase(), venueName.toLowerCase()]
    }
  };
}
