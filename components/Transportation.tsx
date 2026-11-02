import React, { useState } from 'react';
import {
  Plane,
  Bus,
  Car,
  KeyRound,
  ExternalLink,
  Phone,
  Clock,
  MapPin,
  Info
} from 'lucide-react';
import { Language } from '../types';

interface TransportationProps {
  lang: Language;
}

type TransportSection = 'flights' | 'bus' | 'taxi' | 'rentacar' | 'internationalBus';

interface BusStopInfo {
  name: string;
  code: string;
  description?: {
    en: string;
    bs: string;
    de: string;
    tr: string;
  };
}

interface TouristBusLine {
  id: string;
  lineNumber: string;
  badge?: string;
  route: string;
  startPoint: string;
  endPoint: string;
  frequency: string;
  operatingHours: string;
  priceNotice: string;
  description: {
    en: string;
    bs: string;
    de: string;
    tr: string;
  };
  stops: BusStopInfo[];
  scheduleLink?: string;
}

const Transportation: React.FC<TransportationProps> = ({ lang }) => {
  const [activeSection, setActiveSection] = useState<TransportSection>('bus');
  const [selectedBusLine, setSelectedBusLine] = useState<string>('Ka');

  // Bus Stops referenced with official codes
  const BUS_STOPS_MAP: Record<string, BusStopInfo> = {
    PASA_BUNAR: {
      name: 'Paša Bunar',
      code: '98567',
      description: {
        en: 'Western district terminus & junction',
        bs: 'Zapadno gradsko naselje i okretište',
        de: 'Westliche Endstation & Umstieg',
        tr: 'Batı bölgesi son duragi'
      }
    },
    EKONOMSKA: {
      name: 'Ekonomska škola',
      code: '16289',
      description: {
        en: 'Central educational hub near city core',
        bs: 'Ekonomska škola u centru grada',
        de: 'Wirtschaftsschule am Stadtkern',
        tr: 'Şehir merkezi Ekonomi Lisesi duragi'
      }
    },
    TENIS: {
      name: 'Tenis',
      code: '24101',
      description: {
        en: 'Next to Slana Banja park & Pannonica complex',
        bs: 'Pored parka Slana Banja i Panonskih jezera',
        de: 'Am Park Slana Banja und Panonika-Seen',
        tr: 'Slana Banja parkı ve Pannonica gölleri yanı'
      }
    },
    PIVARA: {
      name: 'Pivara',
      code: '722419',
      description: {
        en: 'Historic Tuzla Brewery (Pivara) & Kapija promenade',
        bs: 'Tuzlanska pivara i ulaz prema starom gradu',
        de: 'Historische Brauerei Tuzla & Altstadt',
        tr: 'Tuzla Bira Fabrikası ve eski şehir girişi'
      }
    },
    BRCANSKA_MALTA: {
      name: 'Brčanska Malta',
      code: '56588',
      description: {
        en: 'Eastern commercial hub & transit junction',
        bs: 'Glavno istočno saobraćajno i trgovačko čvorište',
        de: 'Östlicher Verkehrsknoten & Einkaufsviertel',
        tr: 'Doğu ana ulaşım ve ticaret merkezi'
      }
    },
    MUP: {
      name: 'MUP',
      code: '78236',
      description: {
        en: 'Central police & administrative building',
        bs: 'Policijska uprava / Ministarstvo unutrašnjih poslova',
        de: 'Polizeidirektion Tuzla Innenstadt',
        tr: 'Emniyet müdürlüğü duragi'
      }
    },
    SKOJEVSKA: {
      name: 'Skojevska',
      code: '24148',
      description: {
        en: 'Key corridor stop toward UKC and Solina',
        bs: 'Važna stanica prema UKC-u i Solini',
        de: 'Zentrale Haltestelle Richtung UKC / Solina',
        tr: 'Skojevska caddesi UKC ve Solina yönü'
      }
    },
    NOVO_NASELJE: {
      name: 'Novo Naselje',
      code: '76877',
      description: {
        en: 'Residential district stop with local shops',
        bs: 'Stanica Novo Naselje Solina',
        de: 'Wohnviertel Novo Naselje Solina',
        tr: 'Novo Naselje yerleşim duragi'
      }
    },
    SOLINA: {
      name: 'Solina',
      code: '95696',
      description: {
        en: 'North-eastern valley residential terminal',
        bs: 'Okretište Solina, sjeveroistočni dio grada',
        de: 'Endhaltestelle Solina im Nordosten',
        tr: 'Kuzeydoğu Solina son duragi'
      }
    }
  };

  // Curated Tourist Bus Lines: Ka, Kb, 1, 2, 11, 19, 34
  const TOURIST_BUS_LINES: TouristBusLine[] = [
    {
      id: 'Ka',
      lineNumber: 'Ka',
      badge: 'City Circular (Clockwise)',
      route: 'Siporeks – Ekonomska – B. Malta – Mejdan – Siporeks',
      startPoint: 'Siporeks (Zapad)',
      endPoint: 'Kružna linija',
      frequency: '~20–30 min',
      operatingHours: '05:40 – 22:30',
      priceNotice: '1.50 KM (Cash BAM only)',
      description: {
        en: 'Tuzla core circular artery (clockwise). Perfectly connects western hotels, historical center, economy school, and east mall.',
        bs: 'Glavni gradski kružni prsten (u smjeru kazaljke na satu). Povezuje zapadni dio grada, Ekonomsku, Brčansku Maltu i Mejdan.',
        de: 'Zentraler Ringbus (im Uhrzeigersinn). Verbindet den Westen, Altstadt, Schulen und das Einkaufszentrum Brčanska Malta.',
        tr: 'Şehir içi saat yönünde dairesel ring hattı. Batı bölgesi, merkez okullar ve Brčanska Malta merkezini bağlar.'
      },
      scheduleLink: 'https://www.gipstk.com/ka-i-kb/',
      stops: [
        BUS_STOPS_MAP.EKONOMSKA,
        BUS_STOPS_MAP.TENIS,
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.MUP,
        BUS_STOPS_MAP.PIVARA
      ]
    },
    {
      id: 'Kb',
      lineNumber: 'Kb',
      badge: 'City Circular (Counter-Clockwise)',
      route: 'Siporeks – Mejdan – B. Malta – Ekonomska – Siporeks',
      startPoint: 'Siporeks (Zapad)',
      endPoint: 'Kružna linija',
      frequency: '~20–30 min',
      operatingHours: '05:45 – 22:30',
      priceNotice: '1.50 KM (Cash BAM only)',
      description: {
        en: 'Tuzla core circular artery (counter-clockwise). Fast connection between Mejdan arena, eastern shopping and downtown sights.',
        bs: 'Glavni gradski kružni prsten (suprotno smjeru kazaljke). Povezuje Mejdan, Brčansku Maltu, centar i Ekonomsku.',
        de: 'Zentraler Ringbus (gegen den Uhrzeigersinn). Direkte Linie von Mejdan über Brčanska Malta zum Stadtzentrum.',
        tr: 'Saat yönünün tersine dairesel hat. Spor salonu Mejdan, Doğu çarşısı ve şehir merkezine hızlı ulaşım sağlar.'
      },
      scheduleLink: 'https://www.gipstk.com/ka-i-kb/',
      stops: [
        BUS_STOPS_MAP.PIVARA,
        BUS_STOPS_MAP.MUP,
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.TENIS,
        BUS_STOPS_MAP.EKONOMSKA
      ]
    },
    {
      id: '1',
      lineNumber: '1',
      badge: 'Grabovica ↔ Krojčica Corridor',
      route: 'Grabovica – Brčanska Malta – Centar – Krojčica',
      startPoint: 'Grabovica',
      endPoint: 'Krojčica',
      frequency: '~60–75 min',
      operatingHours: '06:15 – 21:10',
      priceNotice: '1.50 KM (Cash BAM only)',
      description: {
        en: 'Cross-city line running right past Pivara brewery, downtown, and Brčanska Malta.',
        bs: 'Povezuje naselja Grabovica i Krojčica preko Pivare, centra i Brčanske Malte.',
        de: 'Querverbindung durch Tuzla mit Halt an der Brauerei, Zentrum und Brčanska Malta.',
        tr: 'Grabovica ve Krojčica arasında Pivara, merkez ve Brčanska Malta üzerinden geçen hat.'
      },
      scheduleLink: 'https://www.gipstk.com/red-voznje/1-grabovica-krojcica/',
      stops: [
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.PIVARA,
        BUS_STOPS_MAP.MUP,
        BUS_STOPS_MAP.PASA_BUNAR
      ]
    },
    {
      id: '2',
      lineNumber: '2',
      badge: 'Solina ↔ Siporeks Mainline',
      route: 'Solina – Skojevska – Ekonomska – Siporeks',
      startPoint: 'Solina',
      endPoint: 'Siporeks',
      frequency: '~20–30 min',
      operatingHours: '05:30 – 22:30',
      priceNotice: '1.50 KM (Cash BAM only)',
      description: {
        en: 'High-frequency city mainline linking northern Solina valley through Skojevska directly to central schools and western commercial zone.',
        bs: 'Visokofrekventna gradska linija od Soline preko Skojevske i Ekonomske škole do Siporeksa.',
        de: 'Dicht getaktete Hauptlinie aus dem Solina-Tal über Skojevska direkt ins Zentrum zur Wirtschaftsschule.',
        tr: 'Solina vadisinden Skojevska ve Ekonomska duragi üzerinden merkeze bağlı sık seferli ana hat.'
      },
      scheduleLink: 'https://www.gipstk.com/red-voznje/2-solina-siporeks/',
      stops: [
        BUS_STOPS_MAP.SOLINA,
        BUS_STOPS_MAP.NOVO_NASELJE,
        BUS_STOPS_MAP.SKOJEVSKA,
        BUS_STOPS_MAP.EKONOMSKA,
        BUS_STOPS_MAP.PASA_BUNAR
      ]
    },
    {
      id: '11',
      lineNumber: '11',
      badge: 'Airport Road – Dubrave',
      route: 'Tuzla (AS Istok) – Donje Dubrave (Airport Road) – Kalesija',
      startPoint: 'Tuzla AS Istok',
      endPoint: 'Kalesija AS',
      frequency: '~45–65 min',
      operatingHours: '05:55 – 18:55',
      priceNotice: '2.50 – 5.50 KM (Cash BAM only)',
      description: {
        en: 'Regional line connecting East Bus Station to Kalesija via Dubrave stop, located ~800m (10 min walk) from Tuzla Airport terminal.',
        bs: 'Regionalna linija sa AS Istok preko Dubrava (cca 800m od zgrade aerodroma TZL) do Kalesije.',
        de: 'Regionalbus vom Ost-Busbahnhof über Donje Dubrave (~800 m zu Fuß zum Flughafen TZL).',
        tr: 'Doğu Otobüs Terminalinden Dubrave üzerinden Kalesija\'ya giden hat. Havalimanına 800 m yürüme mesafesinde durur.'
      },
      scheduleLink: 'https://www.gipstk.com/11-tuzla-kalesija/',
      stops: [
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.TENIS,
        BUS_STOPS_MAP.EKONOMSKA,
        BUS_STOPS_MAP.PIVARA
      ]
    },
    {
      id: '19',
      lineNumber: '19',
      badge: 'Mramor ↔ Solina',
      route: 'Mramor – Solana – Centar – Skojevska – Novo Naselje – Solina',
      startPoint: 'Mramor',
      endPoint: 'Solina',
      frequency: '~60 min',
      operatingHours: '05:55 – 22:10',
      priceNotice: '2.50 – 3.50 KM (Cash BAM only)',
      description: {
        en: 'Key connector from western outskirts and the historical salt factory straight into north Solina residential district.',
        bs: 'Povezuje Mramor, Solanu, centar grada, Skojevsku, Novo Naselje i Solinu.',
        de: 'Verbindet Mramor, Salzwerk, Zentrum, Skojevska und die Haltestelle Solina.',
        tr: 'Mramor ve Solina arasındaki hat; Skojevska, Novo Naselje ve Solina duraklarına uğrar.'
      },
      scheduleLink: 'https://www.gipstk.com/red-voznje/19-mramor-solina/',
      stops: [
        BUS_STOPS_MAP.SOLINA,
        BUS_STOPS_MAP.NOVO_NASELJE,
        BUS_STOPS_MAP.SKOJEVSKA,
        BUS_STOPS_MAP.EKONOMSKA
      ]
    },
    {
      id: '34',
      lineNumber: '34',
      badge: '✈️ Direct Airport Bus',
      route: 'Tuzla (AS Istok) – Brčanska Malta – Tuzla Airport Terminal (Dubrave)',
      startPoint: 'Tuzla AS Istok',
      endPoint: 'Aerodrom Tuzla (TZL)',
      frequency: '~Every 2 hours (sync with flights)',
      operatingHours: '07:00 – 23:00 (Daily)',
      priceNotice: '2.50 – 5.50 KM (~€2.80, Cash BAM only)',
      description: {
        en: 'Official direct express bus stopping directly in front of Tuzla Airport passenger terminal.',
        bs: 'Zvanični direktni autobus koji staje neposredno ispred putničkog terminala Međunarodnog aerodroma Tuzla.',
        de: 'Offizieller Expressbus direkt vor das Passagierterminal des Flughafens Tuzla (TZL).',
        tr: 'Tuzla Havalimanı yolcu terminalinin hemen önüne kadar giden doğrudan ekspres otobüs.'
      },
      scheduleLink: 'https://www.gipstk.com/red-voznje/34-aerodrom-tuzla-b-malta-tuzla-as-istok/',
      stops: [
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.EKONOMSKA,
        BUS_STOPS_MAP.TENIS
      ]
    }
  ];

  // Direct Flights on Tuzla Airport (TZL)
  const FLIGHT_DESTINATIONS = [
    { country: '🇩🇪 Germany', code: 'BER', city: 'Berlin Brandenburg', freq: '~2–3 weekly', time: '1h 40m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'CGN', city: 'Cologne / Bonn', freq: '~2–3 weekly', time: '1h 45m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'DTM', city: 'Dortmund', freq: '~2–4 weekly', time: '1h 45m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'HHN', city: 'Frankfurt Hahn', freq: '~2–3 weekly', time: '1h 40m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'HAM', city: 'Hamburg', freq: '~2–3 weekly', time: '1h 50m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'FKB', city: 'Karlsruhe / Baden-Baden', freq: 'NEW – ~2 weekly', time: '1h 35m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'FMM', city: 'Memmingen / Munich West', freq: '~2–4 weekly', time: '1h 25m', airline: 'Wizz Air' },
    { country: '🇨🇭 Switzerland / 🇫🇷 France', code: 'BSL/MLH', city: 'Basel-Mulhouse-Freiburg', freq: '~3–4 weekly', time: '1h 40m', airline: 'Wizz Air' },
    { country: '🇫🇷 France', code: 'BVA', city: 'Paris Beauvais', freq: '~2 weekly', time: '2h 10m', airline: 'Wizz Air' },
    { country: '🇳🇱 Netherlands', code: 'EIN', city: 'Eindhoven', freq: '~2–3 weekly', time: '2h 00m', airline: 'Wizz Air' },
    { country: '🇸🇪 Sweden', code: 'GOT', city: 'Gothenburg Landvetter', freq: '~2 weekly', time: '2h 15m', airline: 'Wizz Air' },
    { country: '🇸🇪 Sweden', code: 'MMX', city: 'Malmö', freq: '~2–3 weekly', time: '2h 00m', airline: 'Wizz Air' },
    { country: '🇸🇰 Slovakia', code: 'BTS', city: 'Bratislava', freq: '~2 weekly', time: '1h 15m', airline: 'Wizz Air' },
    { country: '🇨🇾 Cyprus', code: 'LCA', city: 'Larnaca', freq: 'Seasonal', time: '2h 30m', airline: 'Wizz Air' },
    { country: '🇹🇷 Turkey', code: 'IST / SAW', city: 'Istanbul (Charters/Seasonal)', freq: 'Pegasus / AJet seasonal', time: '1h 45m', airline: 'Charter' }
  ];

  // Licensed Taxi Services in Tuzla
  const TAXI_SERVICES = [
    {
      name: 'Udruženje Tuzla Taxi',
      shortCall: '1517',
      phone: '+387 35 360 725',
      altPhone: '+387 62 979 333 (Viber)',
      desc: 'Largest official city taxi dispatch network in Tuzla. 24/7 service with calibrated taximeters.',
      airportFare: '~30–40 BAM (€15–20) to city center'
    },
    {
      name: 'Taxi 1525 (Tuzla)',
      shortCall: '1525',
      phone: '1525',
      altPhone: '+387 35 251 525',
      desc: 'Popular and fast downtown dispatch with clean vehicles, airport pickup on request.',
      airportFare: '~30–40 BAM (€15–20)'
    },
    {
      name: 'ASA Bosna Taxi Tuzla',
      shortCall: null,
      phone: '+387 62 707 444',
      altPhone: '0–24 Dispatch',
      desc: 'Modern fleet operating round-the-clock across Tuzla Canton with upfront pricing.',
      airportFare: '~35 BAM fixed average'
    },
    {
      name: 'Taxi Like Tuzla',
      shortCall: null,
      phone: '+387 61 430 000',
      altPhone: 'Viber / WhatsApp',
      desc: 'Reliable private transfers and airport pickups. English-speaking drivers available upon call.',
      airportFare: '~30–40 BAM'
    },
    {
      name: 'Taxi Gold Tuzla',
      shortCall: null,
      phone: '+387 61 012 111',
      altPhone: '24/7 Available',
      desc: 'Comfortable sedans and vans for airport arrival groups.',
      airportFare: '~35–45 BAM'
    },
    {
      name: 'VIP Transfer & Airport Taxi',
      shortCall: null,
      phone: '+387 61 027 555',
      altPhone: 'WhatsApp / Viber 24/7',
      desc: 'Intercity and VIP airport greeting service from terminal gate to hotel door.',
      airportFare: '~40 BAM / €20'
    }
  ];

  // Rent-a-car providers located directly at TZL Airport
  const RENT_A_CAR_AGENCIES = [
    {
      name: 'Carwiz Rent a Car (TZL Airport)',
      phone: '+387 66 993 399',
      location: 'TZL Terminal Arrival Hall',
      email: 'tuzla@carwiz.ba',
      features: 'International franchise, full CDW coverage, debit & credit card accepted.'
    },
    {
      name: 'City Link Rent a Car',
      phone: '+387 61 200 648',
      location: 'Tuzla Airport Dubrave & Center',
      email: 'info@citylink.ba',
      features: 'Local transparent terms, no surprise deposits, delivery to hotel possible.'
    },
    {
      name: 'U-Save / Green Motion Tuzla Airport',
      phone: '+387 61 295 294',
      location: 'Arrival Concourse TZL',
      email: 'reservations@usave.ba',
      features: 'Global booking network, hybrid & economy fleet.'
    },
    {
      name: 'Midago Rent a Car',
      phone: '+387 61 207 333',
      location: 'Airport Terminal Tuzla',
      email: 'midagotuzla@gmail.com',
      features: 'Flexible pickup/dropoff hours coordinated with flight schedules.'
    },
    {
      name: 'Start Line Rent a Car Tuzla',
      phone: '+387 66 350 353',
      location: 'Dubrave Gornje / TZL Gate',
      email: 'info@rentacarstartlinetuzla.com',
      features: 'Quick contract checkout, child seats & GPS available.'
    }
  ];

  // International Bus Lines from Transturist Tuzla (transturist.ba)
  const INTERNATIONAL_BUS_LINES = [
    {
      id: 'tuzla-sarajevo',
      route: 'Tuzla - Sarajevo',
      via: 'Kladanj-Olovo',
      departures: [
        { time: '05:30', days: 'Mon, Tue, Wed, Thu, Fri' },
        { time: '11:45', days: 'Every day' },
        { time: '13:00', days: 'Every day' }
      ],
      arrivalTimes: ['08:30', '14:45', '16:00'],
      returnTimes: ['10:30', '14:00', '17:00', '18:00'],
      duration: '3h 0m - 3h 30m',
      price: '21.00 KM (One way) / 34.80 KM (Return)',
      priceEUR: '€10.50 (One way) / €17.40 (Return)',
      carrier: 'TRANSTURIST',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-321',
      description: {
        en: 'Direct bus line connecting Tuzla to Sarajevo via Kladanj and Olovo. Multiple daily departures with comfortable high-class buses.',
        bs: 'Direktna autobuska linija Tuzla - Sarajevo preko Kladnja i Olova. Više dnevnih polazaka udobnim autobusima visoke klase.',
        de: 'Direkte Busverbindung von Tuzla nach Sarajevo über Kladanj und Olovo. Mehrere tägliche Abfahrten mit komfortablen Hochklasse-Bussen.',
        tr: 'Tuzla ve Sarajevo arasında Kladanj ve Olovo üzerinden direkt otobüs hattı. Günde birkaç sefer, konforlu yüksek sınıf otobüsler.'
      }
    },
    {
      id: 'tuzla-munich',
      route: 'Tuzla - Munich',
      via: 'Srebrenik-Brčko-Lončari-Orašje',
      departures: [
        { time: '10:30', days: 'Tue, Wed, Thu, Fri' },
        { time: '18:00', days: 'Saturday' }
      ],
      arrivalTimes: ['01:30 (+1)', '09:00 (+1)'],
      returnTimes: ['18:30', '18:30'],
      duration: '15h 0m',
      price: 'Varies by season',
      carrier: 'TRANSTURIST',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-325',
      description: {
        en: 'International bus line from Tuzla to Munich, Germany. Overnight journey with modern coaches.',
        bs: 'Međunarodna linija Tuzla - Minhen (Njemačka). Noćna vožnja modernim autobusima.',
        de: 'Internationale Buslinie von Tuzla nach München. Nachtfahrt mit modernen Reisebussen.',
        tr: 'Tuzla ve Münih (Almanya) arasındaki uluslararası otobüs hattı. Modern otobüslerle gece yolculuğu.'
      }
    },
    {
      id: 'tuzla-stuttgart',
      route: 'Tuzla - Stuttgart',
      via: 'Srebrenik-Brčko-Lončari-Orašje',
      departures: [
        { time: '10:30', days: 'Tue, Wed, Thu, Fri' },
        { time: '18:00', days: 'Saturday' }
      ],
      arrivalTimes: ['04:45 (+1)', '12:45 (+1)'],
      returnTimes: ['15:00', '15:00'],
      duration: '16h 15m',
      price: 'Varies by season',
      carrier: 'TRANSTURIST',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-325',
      description: {
        en: 'International bus line from Tuzla to Stuttgart, Germany. Long-distance overnight service.',
        bs: 'Međunarodna linija Tuzla - Stuttgart (Njemačka). Dugopruga noćna usluga.',
        de: 'Internationale Buslinie von Tuzla nach Stuttgart. Fernverkehr mit Nachtfahrt.',
        tr: 'Tuzla ve Stuttgart (Almanya) arasındaki uluslararası otobüs hattı. Uzun mesafe gece servisi.'
      }
    },
    {
      id: 'tuzla-frankfurt',
      route: 'Tuzla - Frankfurt',
      via: 'Srebrenik-Brčko-Lončari-Orašje',
      departures: [
        { time: '10:30', days: 'Tue, Wed, Thu, Fri' },
        { time: '18:00', days: 'Saturday' }
      ],
      arrivalTimes: ['08:30 (+1)', '16:00 (+1)'],
      returnTimes: ['11:30', '11:30'],
      duration: '21h 0m',
      price: 'Varies by season',
      carrier: 'TRANSTURIST',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-325',
      description: {
        en: 'International bus line from Tuzla to Frankfurt, Germany. Overnight journey with stops.',
        bs: 'Međunarodna linija Tuzla - Frankfurt (Njemačka). Noćna vožnja sa zastancima.',
        de: 'Internationale Buslinie von Tuzla nach Frankfurt. Nachtfahrt mit Zwischenstopps.',
        tr: 'Tuzla ve Frankfurt (Almanya) arasındaki uluslararası otobüs hattı. Duraklarla gece yolculuğu.'
      }
    },
    {
      id: 'tuzla-dortmund',
      route: 'Tuzla - Dortmund',
      via: 'Srebrenik-Brčko-Lončari-Orašje',
      departures: [
        { time: '10:30', days: 'Tue, Thu' },
        { time: '18:00', days: 'Saturday' }
      ],
      arrivalTimes: ['13:50 (+1)', '21:20 (+1)'],
      returnTimes: ['05:30', '05:30'],
      duration: '26h 20m',
      price: 'Varies by season',
      carrier: 'TRANSTURIST',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-325',
      description: {
        en: 'International bus line from Tuzla to Dortmund, Germany. Long-distance route with overnight travel.',
        bs: 'Međunarodna linija Tuzla - Dortmund (Njemačka). Dugopruga ruta sa noćnom vožnjom.',
        de: 'Internationale Buslinie von Tuzla nach Dortmund. Fernstrecke mit Nachtfahrt.',
        tr: 'Tuzla ve Dortmund (Almanya) arasındaki uluslararası otobüs hattı. Gece yolculuğu ile uzun mesafe rotası.'
      }
    },
    {
      id: 'tuzla-zagreb',
      route: 'Tuzla - Zagreb',
      via: 'Srebrenik-Brčko-Lončari-Orašje',
      departures: [
        { time: '07:00', days: 'Every day' }
      ],
      arrivalTimes: ['12:30'],
      returnTimes: ['23:30'],
      duration: '5h 30m',
      price: 'Varies by season',
      carrier: 'TRANSTURIST / PEPEX BUS',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-325',
      description: {
        en: 'International bus line from Tuzla to Zagreb, Croatia. Daily departures with modern coaches.',
        bs: 'Međunarodna linija Tuzla - Zagreb (Hrvatska). Dnevni polasci modernim autobusima.',
        de: 'Internationale Buslinie von Tuzla nach Zagreb. Tägliche Abfahrten mit modernen Reisebussen.',
        tr: 'Tuzla ve Zagreb (Hırvatistan) arasındaki uluslararası otobüs hattı. Modern otobüslerle günlük seferler.'
      }
    }
  ];

  const currentLine = TOURIST_BUS_LINES.find((l) => l.lineNumber === selectedBusLine) || TOURIST_BUS_LINES[0];

  // Translation helper
  const t = {
    en: {
      title: 'Transportation in Tuzla',
      subtitle: 'Complete guide to getting around Tuzla by bus, taxi, car rental, and flights.',
      bus: 'Bus',
      flights: 'Flights',
      taxi: 'Taxi',
      rentacar: 'Rent a Car',
      gipsLabel: 'Track your City Bus Line Location',
      busSectionTitle: 'Public Bus Transportation',
      busSectionDesc: 'GIPS Tuzla operates city routes (Ka, Kb, 1, 2) at 1.50 BAM and connecting lines (11, 19, 34) from 2.50 BAM to 5.50 BAM.',
      cityRoutes: 'City routes (Ka, Kb, 1, 2): 1.50 KM',
      connectingLines: 'Connecting lines (11, 19, 34): 2.50 – 5.50 KM',
      selectBusLine: 'Select Bus Line to View Stops & Route:',
      keyStops: 'Key Bus Stops on Route',
      checkSchedule: 'Check live departures for Line',
      flightsSectionTitle: 'Direct Flights to & from Tuzla Airport (TZL)',
      flightsSectionDesc: 'Tuzla International Airport (TZL) is the main gateway for northeastern Bosnia, featuring low-cost direct flights operated by Wizz Air connecting Germany, Switzerland, France, the Netherlands, and Sweden.',
      wizzAirTimetable: 'Wizz Air Timetable & Booking',
      tuzlaAirport: 'Tuzla Airport Official Portal',
      taxiSectionTitle: 'Licensed Taxi Companies in Tuzla',
      taxiSectionDesc: 'A standard taxi ride between Tuzla Airport (TZL) and downtown costs approximately 30–40 BAM (€15–20) and takes 20–25 minutes. In the city, fares run on calibrated taximeters.',
      callTaxi: 'Call Taxi Dispatch',
      rentacarSectionTitle: 'Rent-a-Car Agencies at Tuzla Airport (TZL)',
      rentacarSectionDesc: 'Rental counters are conveniently situated directly inside the arrivals concourse at TZL Airport. Advance reservation is recommended.',
      contactAgency: 'Contact Agency',
      internationalBus: 'Intl. Bus Lines',
      internationalBusSectionTitle: 'International Bus Lines (Transturist Tuzla)',
      internationalBusSectionDesc: 'Transturist Tuzla offers comfortable international bus connections to Germany, Croatia, and other European destinations. Book tickets online at buskarta.ba.',
      domesticBusTitle: 'Domestic: Tuzla - Sarajevo',
      domesticBusDesc: 'Direct connection to Sarajevo via Kladanj-Olovo with multiple daily departures.',
      viewTimetable: 'View Full Timetable & Book',
      transturistOfficial: 'Transturist Official Website'
    },
    bs: {
      title: 'Transport u Tuzli',
      subtitle: 'Potpuni vodič za kretanje Tuzlom autobusom, taksijem, iznajmljivanjem automobila i avionom.',
      bus: 'Autobus',
      flights: 'Avioni',
      taxi: 'Taksi',
      rentacar: 'Iznajmljivanje',
      gipsLabel: 'GIPS red vožnje i lokacija',
      busSectionTitle: 'Javni autobusi',
      busSectionDesc: 'GIPS Tuzla operiše gradske linije (Ka, Kb, 1, 2) po 1.50 KM i povezne linije (11, 19, 34) od 2.50 KM do 5.50 KM.',
      cityRoutes: 'Gradske (Ka, Kb, 1, 2): 1.50 KM',
      connectingLines: 'Povezne (11, 19, 34): 2.50 – 5.50 KM',
      selectBusLine: 'Izaberi liniju za detalje i stanice:',
      keyStops: 'Glavna stajališta na liniji',
      checkSchedule: 'Provjeri detaljan važeći red vožnje za Liniju',
      flightsSectionTitle: 'Direktne avionske linije za i iz Tuzle',
      flightsSectionDesc: 'Međunarodni aerodrom Tuzla (TZL) je glavno zračno čvorište za sjeveroistočnu Bosnu, povezan direktnim letovima kompanije Wizz Air sa ključnim gradovima u Njemačkoj, Švicarskoj, Francuskoj, Holandiji i Švedskoj.',
      wizzAirTimetable: 'Wizz Air Raspored & Rezervacija',
      tuzlaAirport: 'Zvanični portal Aerodroma Tuzla',
      taxiSectionTitle: 'Zvanične taksi službe u Tuzli',
      taxiSectionDesc: 'Standardna vožnja taksijem sa Aerodroma Tuzla do centra grada košta 30–40 KM (€15–20) i traje oko 20–25 minuta. U gradu se vozi po taksimetru.',
      callTaxi: 'Pozovi taksi službu',
      rentacarSectionTitle: 'Rent-a-Car agencije na Aerodromu Tuzla (TZL)',
      rentacarSectionDesc: 'Šalteri agencija se nalaze direktno u dolaznom holu putničkog terminala aerodroma. Preporučujemo rezervaciju unaprijed prije leta.',
      contactAgency: 'Kontaktiraj agenciju',
      internationalBus: 'Međunarodne linije',
      internationalBusSectionTitle: 'Međunarodne autobuskie linije (Transturist Tuzla)',
      internationalBusSectionDesc: 'Transturist Tuzla nudi udobne međunarodne autobuske veze za Njemačku, Hrvatsku i druge evropske destinacije. Rezerviši karte online na buskarta.ba.',
      domesticBusTitle: 'Domaće: Tuzla - Sarajevo',
      domesticBusDesc: 'Direktna veza za Sarajevo preko Kladnja i Olova sa više dnevnih polazaka.',
      viewTimetable: 'Pogledaj puni red vožnje & rezervacija',
      transturistOfficial: 'Zvanična Transturist stranica'
    },
    de: {
      title: 'Transport in Tuzla',
      subtitle: 'Vollständiger Leitfaden für die Fortbewegung in Tuzla mit Bus, Taxi, Mietwagen und Flügen.',
      bus: 'Bus',
      flights: 'Flüge',
      taxi: 'Taxi',
      rentacar: 'Mietwagen',
      gipsLabel: 'Stadtbus-Linie in Echtzeit verfolgen',
      busSectionTitle: 'Öffentlicher Busverkehr',
      busSectionDesc: 'GIPS Tuzla betreibt Stadtlinien (Ka, Kb, 1, 2) für 1.50 KM und Verbindungslinien (11, 19, 34) von 2.50 KM bis 5.50 KM.',
      cityRoutes: 'Stadtlinien (Ka, Kb, 1, 2): 1.50 KM',
      connectingLines: 'Verbindungslinien (11, 19, 34): 2.50 – 5.50 KM',
      selectBusLine: 'Wählen Sie Buslinie für Haltestellen & Route:',
      keyStops: 'Wichtige Bushaltestellen auf Route',
      checkSchedule: 'Aktuelle Abfahrten für Linie',
      flightsSectionTitle: 'Direktflüge zum und vom Flughafen Tuzla (TZL)',
      flightsSectionDesc: 'Der Flughafen Tuzla (TZL) ist das Haupttor für Nordostbosnien mit Direktflügen von Wizz Air nach Deutschland, Schweiz, Frankreich, Niederlande und Schweden.',
      wizzAirTimetable: 'Wizz Air Fahrplan & Buchung',
      tuzlaAirport: 'Offizielle Flughafen Tuzla Website',
      taxiSectionTitle: 'Lizenzierte Taxiunternehmen in Tuzla',
      taxiSectionDesc: 'Eine Standard-Taxifahrt zwischen Flughafen Tuzla (TZL) und Innenstadt kostet ca. 30–40 KM (€15–20) und dauert 20–25 Minuten. In der Stadt wird nach Taxameter gefahren.',
      callTaxi: 'Taxi anrufen',
      rentacarSectionTitle: 'Mietwagenanbieter am Flughafen Tuzla (TZL)',
      rentacarSectionDesc: 'Mietwagenschalter befinden sich direkt im Ankunftsbereich des TZL-Flughafens. Vorabreservierung wird empfohlen.',
      contactAgency: 'Agency kontaktieren',
      internationalBus: 'Internat. Busse',
      internationalBusSectionTitle: 'Internationale Buslinien (Transturist Tuzla)',
      internationalBusSectionDesc: 'Transturist Tuzla bietet komfortable internationale Busverbindungen nach Deutschland, Kroatien und andere europäische Ziele. Tickets online auf buskarta.ba buchen.',
      domesticBusTitle: 'Inland: Tuzla - Sarajevo',
      domesticBusDesc: 'Direktverbindung nach Sarajevo über Kladanj-Olovo mit mehreren täglichen Abfahrten.',
      viewTimetable: 'Fahrplan anzeigen & buchen',
      transturistOfficial: 'Transturist Offizielle Website'
    },
    tr: {
      title: 'Tuzla Ulaşım',
      subtitle: 'Tuzla\'da otobüs, taksi, araba kiralama ve uçakla ulaşımın tam rehberi.',
      bus: 'Otobüs',
      flights: 'Uçuşlar',
      taxi: 'Taksi',
      rentacar: 'Araba Kiralama',
      gipsLabel: 'Şehir otobüs hattını canlı takip et',
      busSectionTitle: 'Toplu Taşıma Otobüsleri',
      busSectionDesc: 'GIPS Tuzla şehir hatları (Ka, Kb, 1, 2) 1.50 KM ve bağlantı hatları (11, 19, 34) 2.50 KM ila 5.50 KM arasında değişmektedir.',
      cityRoutes: 'Şehir hatları (Ka, Kb, 1, 2): 1.50 KM',
      connectingLines: 'Bağlantı hatları (11, 19, 34): 2.50 – 5.50 KM',
      selectBusLine: 'Hat seçin ve durakları görün:',
      keyStops: 'Hat üzerindeki ana duraklar',
      checkSchedule: 'Hat için canlı kalkışları kontrol edin',
      flightsSectionTitle: 'Tuzla Havalimanına (TZL) Direkt Uçuşlar',
      flightsSectionDesc: 'Tuzla Uluslararası Havalimanı (TZL), kuzeydoğu Bosna\'nın ana giriş kapısıdır. Wizz Air tarafından işletilen Almanya, İsviçre, Fransa, Hollanda ve İsveç\'e direkt uçuşlar sunulmaktadır.',
      wizzAirTimetable: 'Wizz Air Seferleri & Rezervasyon',
      tuzlaAirport: 'Tuzla Havalimanı Resmi Sites',
      taxiSectionTitle: 'Tuzla\'da Lisanslı Taksi Şirketleri',
      taxiSectionDesc: 'Tuzla Havalimanı (TZL) ve şehir merkezi arasındaki standart taksi ücreti yaklaşık 30–40 KM (€15–20) olup, 20–25 dakika sürmektedir. Şehir içinde taksimetre ile ücretlendirme yapılmaktadır.',
      callTaxi: 'Taksi çağırmak için tıklayın',
      rentacarSectionTitle: 'Tuzla Havalimanında (TZL) Araba Kiralama',
      rentacarSectionDesc: 'Kiralama ofisleri, TZL Havalimanının varış terminalinde yer almaktadır. Önceden rezervasyon yapılması önerilmektedir.',
      contactAgency: 'Acente ile iletişime geçin',
      internationalBus: 'Uluslararası Otobüsler',
      internationalBusSectionTitle: 'Uluslararası Otobüs Hatları (Transturist Tuzla)',
      internationalBusSectionDesc: 'Transturist Tuzla, Almanya, Hırvatistan ve diğer Avrupa varış noktalarına konforlu uluslararası otobüs bağlantılar sunmaktadır. Biletleri buskarta.ba üzerinde online rezervasyon yapın.',
      domesticBusTitle: 'Yerli: Tuzla - Sarajevo',
      domesticBusDesc: 'Sarajevo\'ya Kladanj-Olovo üzerinden direkt bağlantı, günde birkaç sefer.',
      viewTimetable: 'Tüm Seferleri Gör & Rezervasyon Yap',
      transturistOfficial: 'Transturist Resmi Web Sitesi'
    }
  } as const;

  const translations = t[lang] || t.en;

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-3 sm:px-4 max-w-4xl mx-auto overflow-y-auto pb-32">
      {/* Header Banner */}
      <div className="text-center space-y-1.5 w-full">
        <h1 className="text-2xl sm:text-4xl font-black text-blue-900 drop-shadow-sm uppercase font-quicksand tracking-tight">
          {translations.title}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-2xl mx-auto">
          {translations.subtitle}
        </p>
      </div>

      {/* GIPS Logo and Link */}
      <div className="w-full flex justify-center my-4">
        <a
          href="https://www.gipstk.com/red-voznje/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-between p-2 rounded-3xl hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:scale-[1.02] transition-all duration-500 active:scale-95 bg-white/0 hover:bg-white/50 w-[240px]"
        >
          <div className="w-[240px] h-[150px] bg-white rounded-2xl shadow-lg border border-blue-100 flex items-center justify-center overflow-hidden group-hover:shadow-blue-200 group-hover:shadow-xl transition-shadow duration-300">
            <img
              src="/assets/Gallery/gipslogo.png"
              alt="GIPS Logo"
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <span className="mt-2 text-xs font-bold text-blue-700 uppercase tracking-wider text-center group-hover:text-blue-900 transition-colors">
            {translations.gipsLabel}
          </span>
        </a>
      </div>

      {/* Section Navigation */}
      <div className="w-full rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSection('bus')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black transition-all ${activeSection === 'bus'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
          >
            <Bus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{translations.bus}</span>
          </button>
          <button
            onClick={() => setActiveSection('flights')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black transition-all ${activeSection === 'flights'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
          >
            <Plane className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{translations.flights}</span>
          </button>
          <button
            onClick={() => setActiveSection('taxi')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black transition-all ${activeSection === 'taxi'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
          >
            <Car className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{translations.taxi}</span>
          </button>
          <button
            onClick={() => setActiveSection('rentacar')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black transition-all ${activeSection === 'rentacar'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
          >
            <KeyRound className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{translations.rentacar}</span>
          </button>
          <button
            onClick={() => setActiveSection('internationalBus')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black transition-all ${activeSection === 'internationalBus'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
          >
            <Bus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{translations.internationalBus}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: BUS */}
      {activeSection === 'bus' && (
        <div className="w-full space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 space-y-2">
            <h3 className="text-base sm:text-lg font-black text-blue-950 flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              {translations.busSectionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">{translations.busSectionDesc}</p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="rounded-xl bg-blue-600 text-white px-3 py-1.5 text-xs font-black shadow-xs">
                🚏 {translations.cityRoutes}
              </div>
              <div className="rounded-xl bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-black shadow-xs">
                🚌 {translations.connectingLines}
              </div>
            </div>
          </div>

          {/* Quick Line Selector Pill Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              {translations.selectBusLine}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {TOURIST_BUS_LINES.map((line) => {
                const isSelected = selectedBusLine === line.lineNumber;
                const displayName =
                  line.lineNumber === 'Ka'
                    ? 'Ka Sjever'
                    : line.lineNumber === 'Kb'
                    ? 'Kb Južna'
                    : line.lineNumber === '34'
                    ? '34 Aerodrom'
                    : `Linija ${line.lineNumber}`;
                return (
                  <button
                    key={line.id}
                    onClick={() => setSelectedBusLine(line.lineNumber)}
                    className={`shrink-0 flex items-center gap-2 rounded-2xl px-4 py-2.5 font-black transition-all ${isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
                      : 'bg-white border border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-900'
                      }`}>
                      {line.lineNumber}
                    </span>
                    <span className="text-xs sm:text-sm whitespace-nowrap">{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Line Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-blue-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white shadow-md">
                  {currentLine.lineNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-blue-800">
                      {currentLine.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• GIPS Tuzla</span>
                  </div>
                  <h4 className="mt-1 text-lg sm:text-xl font-black text-slate-900">
                    {currentLine.route}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {currentLine.description[lang] ?? currentLine.description.en}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'bs' ? 'Cijena' : 'Price'}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-emerald-700">
                    {currentLine.priceNotice.split('(')[0].trim()}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'bs' ? 'Frekvencija' : 'Frequency'}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    {currentLine.frequency}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'bs' ? 'Radno vrijeme' : 'Hours'}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    {currentLine.operatingHours}
                  </div>
                </div>
              </div>
            </div>

            {/* Stops without codes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {translations.keyStops}
                </h5>
                <span className="text-xs font-medium text-slate-400">
                  {currentLine.stops.length} {lang === 'bs' ? 'stanica' : 'stops'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentLine.stops.map((stop, index) => (
                  <div
                    key={stop.code + index}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:border-blue-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-xs">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-slate-900 text-sm truncate">{stop.name}</div>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {stop.description ? (stop.description[lang] ?? stop.description.en) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Timetable Link */}
            {currentLine.scheduleLink && (
              <div className="flex items-center justify-between pt-2">
                <a
                  href={currentLine.scheduleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 text-xs font-black transition-all"
                >
                  <span>{translations.checkSchedule} {currentLine.lineNumber}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-[11px] text-slate-400 font-medium">GIPS d.d. Tuzla</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: FLIGHTS ON TZL */}
      {activeSection === 'flights' && (
        <div className="w-full space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
              <Plane className="h-4 w-4" />
              <span>Tuzla International Airport (TZL) – Gornje Dubrave</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              {translations.flightsSectionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {translations.flightsSectionDesc}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://wizzair.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-4 py-2 text-xs font-black transition-all"
              >
                <span>{translations.wizzAirTimetable}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://tuzla-airport.ba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-black transition-all"
              >
                <span>{translations.tuzlaAirport}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Destinations Table / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FLIGHT_DESTINATIONS.map((f, i) => (
              <div
                key={f.code + i}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{f.country}</span>
                  <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-black">
                    {f.code}
                  </span>
                </div>
                <div className="font-black text-base text-slate-900">{f.city}</div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {f.time}
                  </span>
                  <span className="font-semibold text-slate-700">{f.freq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: TAXI SERVICES */}
      {activeSection === 'taxi' && (
        <div className="w-full space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 space-y-2">
            <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
              <Car className="h-5 w-5 text-amber-600" />
              {translations.taxiSectionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700">{translations.taxiSectionDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TAXI_SERVICES.map((taxi) => (
              <div
                key={taxi.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{taxi.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{taxi.desc}</p>
                  </div>
                  {taxi.shortCall && (
                    <span className="rounded-xl bg-amber-500 text-slate-950 px-2.5 py-1 text-xs font-black tracking-wider">
                      📞 {taxi.shortCall}
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold text-slate-400">Telefon:</span>
                    <a href={`tel:${taxi.phone.replace(/\s+/g, '')}`} className="font-black text-blue-600 hover:underline">
                      {taxi.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold text-slate-400">Info / Alternativa:</span>
                    <span className="font-medium text-slate-600">{taxi.altPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 border-t border-slate-200/60 pt-1.5">
                    <span className="font-semibold text-slate-400">Aerodrom tarifa:</span>
                    <span className="font-black text-emerald-700">{taxi.airportFare}</span>
                  </div>
                </div>

                <a
                  href={`tel:${(taxi.shortCall || taxi.phone).replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-black transition-all shadow-sm"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{translations.callTaxi}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: RENT-A-CAR */}
      {activeSection === 'rentacar' && (
        <div className="w-full space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 space-y-2">
            <h3 className="text-base sm:text-lg font-black text-blue-950 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              {translations.rentacarSectionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">{translations.rentacarSectionDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RENT_A_CAR_AGENCIES.map((agency) => (
              <div
                key={agency.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{agency.name}</h4>
                    <p className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {agency.location}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{agency.features}</p>

                <div className="rounded-xl bg-slate-50 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Telefon / WhatsApp:</span>
                    <a href={`tel:${agency.phone.replace(/\s+/g, '')}`} className="font-black text-blue-600 hover:underline">
                      {agency.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">E-mail:</span>
                    <span className="font-mono text-slate-700 text-[11px]">{agency.email}</span>
                  </div>
                </div>

                <a
                  href={`tel:${agency.phone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-black transition-all"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{translations.contactAgency}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: INTERNATIONAL BUS LINES */}
      {activeSection === 'internationalBus' && (
        <div className="w-full space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 space-y-2">
            <h3 className="text-base sm:text-lg font-black text-blue-950 flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              {translations.internationalBusSectionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">{translations.internationalBusSectionDesc}</p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://buskarta.ba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-4 py-2 text-xs font-black transition-all"
              >
                <span>{translations.viewTimetable}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.transturist.ba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-700 border border-blue-200 px-4 py-2 text-xs font-black transition-all"
              >
                <span>{translations.transturistOfficial}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Domestic: Tuzla - Sarajevo */}
          <div className="rounded-2xl border border-blue-200 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-blue-800">
                Domestic
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-slate-900">{translations.domesticBusTitle}</h4>
            <p className="text-xs sm:text-sm text-slate-600">{translations.domesticBusDesc}</p>

            <div className="rounded-xl bg-slate-50 p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                <span>Departure</span>
                <span>Arrival</span>
                <span>Days</span>
              </div>
              {INTERNATIONAL_BUS_LINES[0].departures.map((dep, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm py-1.5 border-b border-slate-100">
                  <span className="font-black text-slate-800">{dep.time}</span>
                  <span className="text-slate-600">{INTERNATIONAL_BUS_LINES[0].arrivalTimes[idx]}</span>
                  <span className="text-slate-500">{dep.days}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                <span className="font-semibold">Duration:</span> {INTERNATIONAL_BUS_LINES[0].duration} | 
                <span className="font-semibold">Price:</span> {INTERNATIONAL_BUS_LINES[0].price}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {INTERNATIONAL_BUS_LINES[0].carrier}
              </div>
            </div>
          </div>

          {/* International Lines */}
          <div className="space-y-4">
            <h4 className="text-base font-black text-blue-900 flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-600" />
              Top 5 International Bus Lines
            </h4>

            {INTERNATIONAL_BUS_LINES.slice(1).map((line) => (
              <div key={line.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-black text-slate-900 text-sm sm:text-base">{line.route}</h5>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{line.duration}</span>
                    </div>
                    <p className="text-xs text-slate-500">via {line.via}</p>
                    <p className="text-xs text-slate-600 mt-1">{line.description[lang] || line.description.en}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider">Departures</span>
                      {line.departures.map((dep, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span className="font-black text-slate-800">{dep.time}</span>
                          <span className="text-slate-400 text-[10px]">{dep.days}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider">Arrivals</span>
                      {line.arrivalTimes.map((arr, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="font-black text-slate-800">{arr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">{line.carrier}</span>
                  <a
                    href={line.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-black transition-all"
                  >
                    <span>Book Tickets</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-slate-600">
            <Info className="h-4 w-4 text-blue-600 float-left mr-2" />
            <p>For the most accurate and up-to-date information, please visit <a href="https://buskarta.ba" className="font-bold text-blue-700 hover:underline">buskarta.ba</a> or call Transturist Tuzla at <a href="tel:+38735320325" className="font-bold text-blue-700 hover:underline">+387 35 320-325</a>.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportation;
