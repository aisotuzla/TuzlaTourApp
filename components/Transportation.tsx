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
  Calendar,
  AlertCircle,
  Mail,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Language } from '../types';

interface TransportationProps {
  lang: Language;
}

type TransportSection = 'flights' | 'bus' | 'taxi' | 'rentacar' | 'internationalBus';

interface BusStopInfo {
  name: string;
  code?: string;
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
  badge: {
    en: string;
    bs: string;
    de: string;
    tr: string;
  };
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
  scheduleLink: string;
  workdayDepartures: string[];
  weekendDepartures: string[];
}

export const Transportation: React.FC<TransportationProps> = ({ lang }) => {
  const [activeSection, setActiveSection] = useState<TransportSection>('bus');
  const [selectedBusLine, setSelectedBusLine] = useState<string>('Ka');
  const [scheduleType, setScheduleType] = useState<'workday' | 'weekend'>('workday');

  // Curated Bus Stops
  const BUS_STOPS_MAP: Record<string, BusStopInfo> = {
    SIPOREKS: {
      name: 'Siporeks (Zapadni terminal)',
      code: '89101',
      description: {
        en: 'Western district hub and commercial junction',
        bs: 'Zapadno gradsko okretište i trgovačko čvorište',
        de: 'Westlicher Verkehrsknoten & Gewerbegebiet',
        tr: 'Batı bölgesi aktarma merkezi'
      }
    },
    EKONOMSKA: {
      name: 'Ekonomska škola (Centar)',
      code: '16289',
      description: {
        en: 'Central educational stop right next to the historic core',
        bs: 'Centralno stajalište kod Ekonomske škole uz historijski centar',
        de: 'Zentrale Haltestelle an der Wirtschaftsschule nahe Altstadt',
        tr: 'Tarihi merkez yanında Ekonomi Lisesi durağı'
      }
    },
    TENIS: {
      name: 'Tenis (Slana Banja / Panonika)',
      code: '24101',
      description: {
        en: 'Next to Slana Banja recreational park & Pannonica salt lakes entrance',
        bs: 'Pored parka Slana Banja i ulaza na Panonska jezera',
        de: 'Am Park Slana Banja und Eingang zu den Pannonischen Salzseen',
        tr: 'Slana Banja parkı ve Panonika gölleri girişi yanı'
      }
    },
    PIVARA: {
      name: 'Pivara (Tuzlanska Pivara & Kapija)',
      code: '722419',
      description: {
        en: 'Historic Tuzla Brewery & access to Kapija old town promenade',
        bs: 'Historijska Tuzlanska pivara i pješački prilaz Kapiji',
        de: 'Historische Brauerei Tuzla & Altstadt-Promenade Kapija',
        tr: 'Tarihi Tuzla Bira Fabrikası ve Kapija girişi'
      }
    },
    BRCANSKA_MALTA: {
      name: 'Brčanska Malta (Istočni terminal)',
      code: '56588',
      description: {
        en: 'Main eastern transport interchange and shopping district',
        bs: 'Glavno istočno saobraćajno čvorište i tržni centri',
        de: 'Großer östlicher Verkehrsknotenpunkt und Einkaufszone',
        tr: 'Doğu ana ulaşım kavşağı ve alışveriş bölgesi'
      }
    },
    MUP: {
      name: 'MUP (Ministarstvo unutrašnjih poslova)',
      code: '78236',
      description: {
        en: 'Central administrative and public safety boulevard',
        bs: 'Centralna policijska uprava i administrativni bulevar',
        de: 'Polizeipräsidium Innenstadt-Boulevard',
        tr: 'Emniyet müdürlüğü durağı'
      }
    },
    MEJDAN: {
      name: 'SKPC Mejdan',
      code: '33102',
      description: {
        en: 'Sports and Cultural Center Mejdan arena',
        bs: 'Sportsko-kulturni i privredni centar Mejdan',
        de: 'Sport- und Kulturzentrum Mejdan',
        tr: 'Mejdan Spor ve Kültür Merkezi'
      }
    },
    SOLINA: {
      name: 'Solina (Naselje)',
      code: '12401',
      description: {
        en: 'Northern scenic residential valley of Tuzla',
        bs: 'Sjeverno stambeno naselje grada',
        de: 'Nördliches Wohngebiet Tuzlas',
        tr: 'Tuzla kuzey yerleşim bölgesi'
      }
    },
    SKOJEVSKA: {
      name: 'Skojevska',
      code: '24148',
      description: {
        en: 'Transit corridor connecting northern valley to downtown',
        bs: 'Glavna saobraćajnica od Soline prema centru grada',
        de: 'Verbindungsstraße von Solina ins Stadtzentrum',
        tr: 'Kuzey vadiyi merkeze bağlayan ana koridor'
      }
    },
    PASA_BUNAR: {
      name: 'Paša Bunar',
      code: '98567',
      description: {
        en: 'Western residential district terminus',
        bs: 'Zapadno stambeno naselje',
        de: 'Westliche Wohngegend',
        tr: 'Batı yerleşim bölgesi'
      }
    },
    AS_ISTOK: {
      name: 'Autobuska Stanica Istok (AS Istok)',
      code: '45100',
      description: {
        en: 'Eastern long-distance & regional bus terminal',
        bs: 'Istočna autobuska stanica za kantonalne i regionalne linije',
        de: 'Ost-Busbahnhof für regionale Verbindungen',
        tr: 'Doğu otobüs terminali'
      }
    },
    DUBRAVE_RASKRSCE: {
      name: 'Donje Dubrave (Airport Road ~800m)',
      code: '52200',
      description: {
        en: 'Dubrave junction, ~800m (10 min easy walk) from TZL passenger terminal',
        bs: 'Raskršće u Dubravama, cca 800m (10 min hoda) od zgrade aerodroma TZL',
        de: 'Kreuzung Dubrave, ca. 800 m Fußweg zum Flughafenterminal TZL',
        tr: 'Dubrave kavşağı, TZL havalimanı terminaline 800 m (10 dk yürüme)'
      }
    },
    AERODROM_TERMINAL: {
      name: 'Aerodrom Tuzla – Putnički Terminal (TZL)',
      code: '77700',
      description: {
        en: 'Direct stop right in front of the airport departure/arrival terminal',
        bs: 'Direktno stajalište ispred zgrade putničkog terminala aerodroma',
        de: 'Haltestelle direkt vor dem Flugterminal des Flughafens Tuzla',
        tr: 'Havalimanı gidiş/geliş terminal binasının tam önündeki durak'
      }
    }
  };

  // 5 Essential Curated Tourist Lines: Ka, Kb, 2, 11, 34
  const TOURIST_BUS_LINES: TouristBusLine[] = [
    {
      id: 'Ka',
      lineNumber: 'Ka',
      badge: {
        en: 'City Circular (Clockwise)',
        bs: 'Gradska kružna (U smjeru kazaljke)',
        de: 'Stadtring (Uhrzeigersinn)',
        tr: 'Şehir İçi Halka (Saat Yönü)'
      },
      route: 'Siporeks – Ekonomska – Tenis (Panonika) – B. Malta – Mejdan – Pivara – Siporeks',
      startPoint: 'Siporeks (Zapad)',
      endPoint: 'Kružna linija',
      frequency: '~30 min (Radni dan & Subota) • 60 min (Nedjelja)',
      operatingHours: '06:00 – 21:00',
      priceNotice: '1.50 KM (BAM gotovina u busu)',
      description: {
        en: 'Tuzla core circular artery running clockwise. Connects western hotels, historical core, economy school, Pannonica park, and eastern shopping malls.',
        bs: 'Glavni gradski kružni prsten u smjeru kazaljke na satu. Povezuje zapadni dio grada, centar, Ekonomsku školu, Panonska jezera, Brčansku Maltu i Mejdan.',
        de: 'Zentraler Ringbus im Uhrzeigersinn. Verbindet den Westen, Altstadt, Schulen, Panonika-Seen und das Einkaufszentrum Brčanska Malta.',
        tr: 'Şehir içi saat yönünde dairesel hat. Batı bölgesi, tarihi merkez, okullar, Panonika gölleri ve Brčanska Malta alışveriş bölgesini bağlar.'
      },
      scheduleLink: 'https://www.gipstk.com/ka-i-kb/',
      stops: [
        BUS_STOPS_MAP.SIPOREKS,
        BUS_STOPS_MAP.EKONOMSKA,
        BUS_STOPS_MAP.TENIS,
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.MUP,
        BUS_STOPS_MAP.MEJDAN,
        BUS_STOPS_MAP.PIVARA
      ],
      workdayDepartures: [
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
      ],
      weekendDepartures: [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00'
      ]
    },
    {
      id: 'Kb',
      lineNumber: 'Kb',
      badge: {
        en: 'City Circular (Counter-Clockwise)',
        bs: 'Gradska kružna (Suprotno smjeru kazaljke)',
        de: 'Stadtring (Gegen Uhrzeigersinn)',
        tr: 'Şehir İçi Halka (Ters Yön)'
      },
      route: 'Siporeks – Pivara – Mejdan – MUP – B. Malta – Tenis – Ekonomska – Siporeks',
      startPoint: 'Siporeks (Zapad)',
      endPoint: 'Kružna linija',
      frequency: '~30 min (Radni dan & Subota) • 60 min (Nedjelja)',
      operatingHours: '06:00 – 21:00',
      priceNotice: '1.50 KM (BAM gotovina u busu)',
      description: {
        en: 'Tuzla core circular artery running counter-clockwise. Provides fast direct transit from Mejdan arena, southern boulevard, and east commercial zone into downtown.',
        bs: 'Glavni gradski kružni prsten u smjeru suprotnom kazaljci. Brza veza sa Mejdana, južne magistrale i Brčanske Malte prema centru.',
        de: 'Zentraler Ringbus gegen den Uhrzeigersinn. Schnelle Verbindung von Mejdan und Brčanska Malta zurück ins Zentrum.',
        tr: 'Saat yönünün tersine dairesel hat. Mejdan spor kompleksi, güney bulvarı ve çarşıdan merkeze hızlı bağlantı.'
      },
      scheduleLink: 'https://www.gipstk.com/ka-i-kb/',
      stops: [
        BUS_STOPS_MAP.SIPOREKS,
        BUS_STOPS_MAP.PIVARA,
        BUS_STOPS_MAP.MEJDAN,
        BUS_STOPS_MAP.MUP,
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.TENIS,
        BUS_STOPS_MAP.EKONOMSKA
      ],
      workdayDepartures: [
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
      ],
      weekendDepartures: [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00'
      ]
    },
    {
      id: '2',
      lineNumber: '2',
      badge: {
        en: 'Solina ↔ Siporeks Mainline',
        bs: 'Solina ↔ Siporeks Glavna linija',
        de: 'Solina ↔ Siporeks Hauptachse',
        tr: 'Solina ↔ Siporeks Ana Hat'
      },
      route: 'Solina – Skojevska – Ekonomska škola – Centar – Paša Bunar – Siporeks',
      startPoint: 'Solina (Sjever)',
      endPoint: 'Siporeks (Zapad)',
      frequency: '~20–30 min',
      operatingHours: '05:30 – 22:30',
      priceNotice: '1.50 KM (BAM gotovina u busu)',
      description: {
        en: 'High-frequency city mainline linking northern Solina residential valley directly through Skojevska to central schools and the western commercial zone.',
        bs: 'Visokofrekventna gradska magistrala koja povezuje sjeverno naselje Solina preko Skojevske i Ekonomske škole do Siporeksa.',
        de: 'Dicht getaktete Hauptlinie aus dem Solina-Tal über Skojevska direkt ins Zentrum zur Wirtschaftsschule.',
        tr: 'Solina vadisinden Skojevska ve Ekonomska üzerinden merkeze bağlayan sık seferli ana hat.'
      },
      scheduleLink: 'https://www.gipstk.com/red-voznje/2-solina-siporeks/',
      stops: [
        BUS_STOPS_MAP.SOLINA,
        BUS_STOPS_MAP.SKOJEVSKA,
        BUS_STOPS_MAP.EKONOMSKA,
        BUS_STOPS_MAP.PASA_BUNAR,
        BUS_STOPS_MAP.SIPOREKS
      ],
      workdayDepartures: [
        '05:30', '06:00', '06:30', '07:00', '07:30', '08:00',
        '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
        '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
        '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
        '17:30', '18:00', '18:30', '19:00', '20:00', '21:00', '22:15'
      ],
      weekendDepartures: [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
      ]
    },
    {
      id: '11',
      lineNumber: '11',
      badge: {
        en: 'Regional • Airport Road Dubrave',
        bs: 'Regionalna • Aerodrom raskršće Dubrave',
        de: 'Regionalbus • Flughafenstraße Dubrave',
        tr: 'Bölgesel • Havalimanı Yolu Dubrave'
      },
      route: 'Tuzla (AS Istok) – Brčanska Malta – Slavinovići – Donje Dubrave (Aerodrom ~800m) – Kalesija',
      startPoint: 'Tuzla AS Istok',
      endPoint: 'Kalesija AS',
      frequency: '~60–75 min',
      operatingHours: '05:55 – 18:55',
      priceNotice: '2.50 – 5.50 KM (Ovisno o zoni, BAM gotovina)',
      description: {
        en: 'Regional line connecting East Bus Station to Kalesija via Dubrave stop, located ~800m (10 min easy walk) from Tuzla Airport passenger terminal.',
        bs: 'Regionalna linija sa AS Istok preko Brčanske Malte i Dubrava do Kalesije. Stajalište u Dubravama je udaljeno 800m (10 min hoda) od zgrade aerodroma TZL.',
        de: 'Regionalbus vom Ost-Busbahnhof über Donje Dubrave (ca. 800 m Fußweg zum Flughafenterminal TZL).',
        tr: 'Doğu Otobüs Terminalinden Dubrave üzerinden Kalesija\'ya giden hat. Havalimanına 800 m yürüme mesafesinde durur.'
      },
      scheduleLink: 'https://www.gipstk.com/11-tuzla-kalesija/',
      stops: [
        BUS_STOPS_MAP.AS_ISTOK,
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.TENIS,
        BUS_STOPS_MAP.DUBRAVE_RASKRSCE
      ],
      workdayDepartures: [
        '05:55', '06:45', '07:30', '08:30', '10:00', '11:30',
        '13:00', '14:15', '15:30', '17:00', '18:55'
      ],
      weekendDepartures: [
        '06:45', '08:30', '11:30', '14:15', '17:00', '18:55'
      ]
    },
    {
      id: '34',
      lineNumber: '34',
      badge: {
        en: '✈️ Direct Airport Terminal Express',
        bs: '✈️ Direktni aerodromski ekspres',
        de: '✈️ Direkter Flughafen-Expressbus',
        tr: '✈️ Direkt Havalimanı Terminali Otobüsü'
      },
      route: 'Aerodrom Tuzla (Terminal Dubrave) – Dubrave Gornje – Brčanska Malta – Tuzla AS Istok',
      startPoint: 'Aerodrom Tuzla (TZL)',
      endPoint: 'Tuzla AS Istok',
      frequency: '~Svaka 1.5 – 2h (Usklađeno s letovima)',
      operatingHours: '07:00 – 22:30 (Dnevno)',
      priceNotice: '2.50 – 5.50 KM (~€2.80, BAM gotovina)',
      description: {
        en: 'Official direct express bus stopping directly in front of Tuzla Airport passenger terminal building. Fully synchronized with flight arrival schedules.',
        bs: 'Zvanični direktni ekspresni autobus koji staje neposredno ispred putničkog terminala Međunarodnog aerodroma Tuzla. Usklađen sa redom letenja Wizz Aira.',
        de: 'Offizieller Expressbus direkt vor das Passagierterminal des Flughafens Tuzla (TZL), abgestimmt auf Flugankünfte.',
        tr: 'Tuzla Havalimanı yolcu terminalinin tam önüne kadar giden doğrudan ekspres otobüs. Uçuş saatleriyle uyumludur.'
      },
      scheduleLink: 'https://www.gipstk.com/red-voznje/34-aerodrom-tuzla-b-malta-tuzla-as-istok/',
      stops: [
        BUS_STOPS_MAP.AERODROM_TERMINAL,
        BUS_STOPS_MAP.DUBRAVE_RASKRSCE,
        BUS_STOPS_MAP.BRCANSKA_MALTA,
        BUS_STOPS_MAP.AS_ISTOK
      ],
      workdayDepartures: [
        '07:00', '08:45', '10:30', '12:15', '14:00', '16:00',
        '18:00', '20:15', '22:30'
      ],
      weekendDepartures: [
        '07:00', '08:45', '10:30', '12:15', '14:00', '16:00',
        '18:00', '20:15', '22:30'
      ]
    }
  ];

  // Direct Flights at Tuzla Airport (TZL)
  const FLIGHT_DESTINATIONS = [
    { country: '🇩🇪 Germany', code: 'BER', city: 'Berlin Brandenburg', freq: '~2–3 weekly', time: '1h 40m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'DTM', city: 'Dortmund', freq: '~2–4 weekly', time: '1h 45m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'FMM', city: 'Memmingen / Munich West', freq: '~2–4 weekly', time: '1h 25m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'CGN', city: 'Cologne / Bonn', freq: '~2–3 weekly', time: '1h 45m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'HHN', city: 'Frankfurt Hahn', freq: '~2–3 weekly', time: '1h 40m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'HAM', city: 'Hamburg', freq: '~2–3 weekly', time: '1h 50m', airline: 'Wizz Air' },
    { country: '🇩🇪 Germany', code: 'FKB', city: 'Karlsruhe / Baden-Baden', freq: 'NEW • ~2 weekly', time: '1h 35m', airline: 'Wizz Air' },
    { country: '🇨🇭 Switzerland / 🇫🇷 France', code: 'BSL', city: 'Basel-Mulhouse-Freiburg', freq: '~3–4 weekly', time: '1h 40m', airline: 'Wizz Air' },
    { country: '🇫🇷 France', code: 'BVA', city: 'Paris Beauvais', freq: '~2 weekly', time: '2h 10m', airline: 'Wizz Air' },
    { country: '🇳🇱 Netherlands', code: 'EIN', city: 'Eindhoven', freq: '~2–3 weekly', time: '2h 00m', airline: 'Wizz Air' },
    { country: '🇸🇪 Sweden', code: 'GOT', city: 'Gothenburg Landvetter', freq: '~2 weekly', time: '2h 15m', airline: 'Wizz Air' },
    { country: '🇸🇪 Sweden', code: 'MMX', city: 'Malmö', freq: '~2–3 weekly', time: '2h 00m', airline: 'Wizz Air' },
    { country: '🇸🇰 Slovakia', code: 'BTS', city: 'Bratislava', freq: '~2 weekly', time: '1h 15m', airline: 'Wizz Air' },
    { country: '🇨🇾 Cyprus', code: 'LCA', city: 'Larnaca', freq: 'Seasonal', time: '2h 30m', airline: 'Wizz Air' },
    { country: '🇹🇷 Turkey', code: 'IST / SAW', city: 'Istanbul (Charters)', freq: 'Pegasus / AJet seasonal', time: '1h 45m', airline: 'Charter' }
  ];

  // Licensed Taxi Services with direct call phone hooks
  const TAXI_SERVICES = [
    {
      name: 'Udruženje Tuzla Taxi',
      shortCall: '1517',
      phone: '+387 35 360 725',
      rawPhone: '+38735360725',
      altPhone: '+387 62 979 333 (Viber)',
      desc: 'Largest official city taxi dispatch network in Tuzla. 24/7 service with calibrated taximeters.',
      airportFare: '~30–40 BAM (€15–20)'
    },
    {
      name: 'Taxi 1525 (Tuzla)',
      shortCall: '1525',
      phone: '1525',
      rawPhone: '1525',
      altPhone: '+387 35 251 525',
      desc: 'Popular and fast downtown dispatch with clean vehicles, airport pickup on request.',
      airportFare: '~30–40 BAM (€15–20)'
    },
    {
      name: 'ASA Bosna Taxi Tuzla',
      shortCall: null,
      phone: '+387 62 707 444',
      rawPhone: '+38762707444',
      altPhone: '0–24 Dispatch',
      desc: 'Modern fleet operating round-the-clock across Tuzla Canton with upfront pricing.',
      airportFare: '~35 BAM fixed average'
    },
    {
      name: 'Taxi Like Tuzla',
      shortCall: null,
      phone: '+387 61 430 000',
      rawPhone: '+38761430000',
      altPhone: 'Viber / WhatsApp',
      desc: 'Reliable private transfers and airport pickups. English-speaking drivers available upon call.',
      airportFare: '~30–40 BAM'
    },
    {
      name: 'Taxi Gold Tuzla',
      shortCall: null,
      phone: '+387 61 012 111',
      rawPhone: '+38761012111',
      altPhone: '24/7 Available',
      desc: 'Comfortable sedans and vans for airport arrival groups.',
      airportFare: '~35–45 BAM'
    },
    {
      name: 'VIP Transfer & Airport Taxi',
      shortCall: null,
      phone: '+387 61 027 555',
      rawPhone: '+38761027555',
      altPhone: 'WhatsApp / Viber 24/7',
      desc: 'Intercity and VIP airport greeting service from terminal gate to hotel door.',
      airportFare: '~40 BAM / €20'
    }
  ];

  // Rent-a-car providers located at TZL Airport
  const RENT_A_CAR_AGENCIES = [
    {
      name: 'Carwiz Rent a Car (TZL Airport)',
      phone: '+387 66 993 399',
      rawPhone: '+38766993399',
      location: 'TZL Terminal Arrival Hall',
      email: 'tuzla@carwiz.ba',
      features: 'International franchise, full CDW coverage, debit & credit card accepted.'
    },
    {
      name: 'City Link Rent a Car',
      phone: '+387 61 200 648',
      rawPhone: '+38761200648',
      location: 'Tuzla Airport Dubrave & Center',
      email: 'info@citylink.ba',
      features: 'Local transparent terms, no surprise deposits, delivery to hotel possible.'
    },
    {
      name: 'U-Save / Green Motion Tuzla Airport',
      phone: '+387 61 295 294',
      rawPhone: '+38761295294',
      location: 'Arrival Concourse TZL',
      email: 'reservations@usave.ba',
      features: 'Global booking network, hybrid & economy fleet.'
    },
    {
      name: 'Midago Rent a Car',
      phone: '+387 61 207 333',
      rawPhone: '+38761207333',
      location: 'Airport Terminal Tuzla',
      email: 'midagotuzla@gmail.com',
      features: 'Flexible pickup/dropoff hours coordinated with flight schedules.'
    },
    {
      name: 'Start Line Rent a Car Tuzla',
      phone: '+387 66 350 353',
      rawPhone: '+38766350353',
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

  const currentT = t[lang] || t.en;
  const currentLine = TOURIST_BUS_LINES.find((l) => l.lineNumber === selectedBusLine) || TOURIST_BUS_LINES[0];
  const activeDepartures = scheduleType === 'workday' ? currentLine.workdayDepartures : currentLine.weekendDepartures;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-36 space-y-6">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 border border-blue-900/60 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-black uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>Tuzla Transit Hub</span>
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

      {/* 2. MAIN SEGMENT SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setActiveSection('bus')}
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all shadow-sm ${activeSection === 'bus'
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30 shadow-md ring-2 ring-blue-400/40'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <Bus className="w-4 h-4 shrink-0" />
          <span>{currentT.busesTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('flights')}
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all shadow-sm ${activeSection === 'flights'
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30 shadow-md ring-2 ring-blue-400/40'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <Plane className="w-4 h-4 shrink-0" />
          <span>{currentT.flightsTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('taxi')}
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all shadow-sm ${activeSection === 'taxi'
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30 shadow-md ring-2 ring-blue-400/40'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <Car className="w-4 h-4 shrink-0" />
          <span>{currentT.taxiTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('rentacar')}
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all shadow-sm ${activeSection === 'rentacar'
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30 shadow-md ring-2 ring-blue-400/40'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          <span>{currentT.rentacarTab}</span>
        </button>
      </div>

      {/* 3. SECTION 1: BUSES & GIPS LIVE */}
      {activeSection === 'bus' && (
        <div className="space-y-6">
          {/* GIPS LOGO & LIVE TRACKING BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 border border-blue-700/50 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-36 h-20 bg-white rounded-2xl p-2.5 flex items-center justify-center shrink-0 shadow-md border border-white/20">
                  <img
                    src="/assets/Gallery/gipslogo.png"
                    alt="GIPS Tuzla Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {currentT.gipsBannerTitle}
                  </h3>
                  <p className="text-xs text-blue-200/90 leading-relaxed max-w-xl">
                    {currentT.gipsBannerDesc}
                  </p>
                </div>
              </div>

              <a
                href="https://www.gipstk.com/red-voznje/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 shrink-0 uppercase tracking-wider"
              >
                <span>{currentT.gipsLiveCta}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* BUS LINES SELECTOR (Ka, Kb, 2, 11, 34) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {currentT.selectLine}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                5 {lang === 'bs' ? 'ključnih linija (Ka, Kb, 2, 11, 34)' : 'essential lines'}
              </span>
            </div>

            {/* Pills grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {TOURIST_BUS_LINES.map((line) => {
                const isSelected = selectedBusLine === line.lineNumber;
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => setSelectedBusLine(line.lineNumber)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center relative ${isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                  >
                    <span className={`text-xl font-black ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                      {line.lineNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mt-0.5 truncate max-w-full">
                      {line.badge[lang] || line.badge.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED LINE DETAILS CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
                  <span>{currentLine.badge[lang] || currentLine.badge.en}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Linija {currentLine.lineNumber}: {currentLine.route}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {currentLine.description[lang] || currentLine.description.en}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bs' ? 'Cijena' : 'Fare'}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-emerald-700">
                    {currentLine.priceNotice.split('(')[0]}
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bs' ? 'Radno vrijeme' : 'Hours'}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    {currentLine.operatingHours}
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTE TIMELINE / STOPS */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{currentT.routeTimeline}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentLine.stops.map((stop, idx) => (
                  <div
                    key={stop.name + idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {stop.name}
                      </div>
                      {stop.description && (
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {stop.description[lang] || stop.description.en}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE TIMETABLE GRID */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{currentT.timetableHeader}</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeDepartures.length} {currentT.departuresCount}
                  </p>
                </div>

                {/* Day Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setScheduleType('workday')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${scheduleType === 'workday'
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {currentT.workdays}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('weekend')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${scheduleType === 'weekend'
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {currentT.sunday}
                  </button>
                </div>
              </div>

              {/* Departure pills matrix */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {activeDepartures.map((time, idx) => (
                  <div
                    key={time + idx}
                    className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-center font-mono font-bold text-xs sm:text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Cash notice & Official Web link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs">
                <div className="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{currentT.cashNotice}</span>
                </div>

                <a
                  href={currentLine.scheduleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline shrink-0"
                >
                  <span>{currentT.openGipsWeb}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION 2: FLIGHTS (TZL AIRPORT) */}
      {activeSection === 'flights' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white space-y-4 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-cyan-400/30">
              <Plane className="w-3.5 h-3.5" />
              <span>Tuzla International Airport (TZL)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentT.flightsHeader}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {currentT.flightsSub}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://wizzair.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 uppercase tracking-wider"
              >
                <span>{currentT.bookWizz}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://tuzla-airport.ba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-xs sm:text-sm font-black transition-all border border-white/20 active:scale-95"
              >
                <span>{currentT.airportSite}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FLIGHT_DESTINATIONS.map((f, i) => (
              <div
                key={f.code + i}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{f.country}</span>
                  <span className="rounded-xl bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-black">
                    {f.code}
                  </span>
                </div>
                <div className="font-black text-lg text-slate-900">{f.city}</div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {f.time}
                  </span>
                  <span className="font-bold text-blue-700">{f.freq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECTION 3: TAXI SERVICES (WITH DIRECT CALL HOOKS) */}
      {activeSection === 'taxi' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-6 space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-amber-950 flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-600" />
              <span>{currentT.taxiHeader}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
              {currentT.taxiSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TAXI_SERVICES.map((taxi) => (
              <div
                key={taxi.name}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{taxi.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{taxi.desc}</p>
                    </div>
                    {taxi.shortCall && (
                      <span className="rounded-2xl bg-amber-400 text-slate-950 px-3 py-1 text-xs font-black tracking-wider shrink-0 shadow-sm">
                        📞 {taxi.shortCall}
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2 text-xs border border-slate-100">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-400">Telefon:</span>
                      <a href={`tel:${taxi.rawPhone}`} className="font-black text-blue-600 hover:underline">
                        {taxi.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-400">Info:</span>
                      <span className="font-medium text-slate-600">{taxi.altPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 border-t border-slate-200/60 pt-2">
                      <span className="font-semibold text-slate-400">Aerodrom tarifa:</span>
                      <span className="font-black text-emerald-700">{taxi.airportFare}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Call Button Hook */}
                <a
                  href={`tel:${taxi.rawPhone}`}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 uppercase tracking-wider"
                >
                  <Phone className="w-4 h-4" />
                  <span>{currentT.callNow} ({taxi.shortCall || taxi.phone})</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SECTION 4: RENT-A-CAR (WITH DIRECT CALL & CONTACT HOOKS) */}
      {activeSection === 'rentacar' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-blue-950 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>{currentT.rentacarHeader}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {currentT.rentacarSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RENT_A_CAR_AGENCIES.map((agency) => (
              <div
                key={agency.name}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{agency.name}</h4>
                    <p className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{agency.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {agency.features}
                  </p>

                  <div className="rounded-2xl bg-slate-50 p-3.5 space-y-1.5 text-xs border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Telefon:</span>
                      <a href={`tel:${agency.rawPhone}`} className="font-black text-blue-600 hover:underline">
                        {agency.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">E-mail:</span>
                      <a href={`mailto:${agency.email}`} className="font-mono text-slate-700 hover:underline">
                        {agency.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons Hook */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${agency.rawPhone}`}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs font-black transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{currentT.callAgency}</span>
                  </a>
                  <a
                    href={`mailto:${agency.email}`}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 text-xs font-black transition-all border border-slate-200 active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentT.emailAgency}</span>
                  </a>
                </div>
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
