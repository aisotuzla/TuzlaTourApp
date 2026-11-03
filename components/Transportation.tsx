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
  Compass,
  Globe,
  Info,
  Sun,
  Ticket,
  Sparkles,
  Users
} from 'lucide-react';
import { Language } from '../types';

interface TransportationProps {
  lang: Language;
}

type TransportSection = 'bus' | 'internationalBus' | 'flights' | 'taxi' | 'rentacar';

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

  // International and Domestic Intercity Bus Lines (Transturist Tuzla)
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
      price: 'Varies by season (~120-160 KM)',
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
      id: 'tuzla-beograd',
      route: 'Tuzla - Beograd',
      via: 'Priboj - Ugljevik - Bijeljina - Bosut - Kuzmin - Sremska Mitrovica',
      departures: [
        { time: '06:15', days: 'Svaki dan / Daily' },
        { time: '16:25', days: 'Svaki dan / Daily' },
        { time: '19:00', days: 'Svaki dan / Daily' }
      ],
      arrivalTimes: ['10:45', '20:55', '23:30'],
      returnTimes: ['06:30', '13:00', '17:30'],
      duration: '~4h 15m - 4h 30m',
      price: '28.00 KM (Jedan smjer) / 45.00 KM (Povratna)',
      carrier: 'TRANSTURIST',
      bookingLink: 'https://buskarta.ba',
      phone: '+387 35 320-325',
      description: {
        en: 'International bus line connecting Tuzla to Belgrade (Serbia) via Priboj, Ugljevik, Bijeljina, Bosut, Kuzmin, and Sremska Mitrovica. Three daily departures.',
        bs: 'Međunarodna autobuska linija Tuzla - Beograd preko Priboja, Ugljevika, Bijeljine, Bosuta, Kuzmina i Sremske Mitrovice. Polasci svakog dana u 06:15h, 16:25h i 19:00h.',
        de: 'Internationale Buslinie von Tuzla nach Belgrad (Serbien) über Priboj, Ugljevik, Bijeljina, Bosut, Kuzmin und Sremska Mitrovica. Täglich um 06:15, 16:25 und 19:00 Uhr.',
        tr: 'Tuzla - Belgrad (Sırbistan) güzergahı: Priboj, Ugljevik, Bijeljina, Bosut, Kuzmin ve Sremska Mitrovica üzerinden. Her gün 06:15, 16:25 ve 19:00 seferleri.'
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
      price: 'Varies by season (~45-55 KM)',
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

  const t = {
    en: {
      title: 'Tuzla Transit Hub',
      subtitle: 'Complete public transit, GIPS live tracking, airport connections, verified taxi dispatch and car rental.',
      busesTab: 'Buses (GIPS)',
      intlBusTab: 'Intercity & Intl. Bus',
      flightsTab: 'Flights (TZL)',
      taxiTab: 'Taxis (Call)',
      rentacarTab: 'Rent a Car',
      gipsBannerTitle: 'Official City & Regional Bus Network',
      gipsBannerDesc: 'GIPS d.d. Tuzla operates city lines (Ka, Kb, 2) at 1.50 BAM (€0.77) and airport connections (11, 34) at 2.50–5.50 BAM. Cash only on board.',
      gipsLiveCta: 'Live Bus Tracking & Online Timetable',
      selectLine: 'Select Bus Line:',
      routeTimeline: 'Route & Key Stops',
      timetableHeader: 'Official Timetable & Departures',
      workdays: 'Workday & Saturday',
      sunday: 'Sunday & Holidays',
      departuresCount: 'scheduled departures daily',
      cashNotice: 'Driver accepts Cash BAM (KM) only upon boarding. Please have exact change.',
      openGipsWeb: 'View on GIPS Portal',
      flightsHeader: 'Direct International Flights at TZL',
      flightsSub: 'Tuzla International Airport (TZL) is Northeastern Bosnia\'s primary aviation hub, connecting major European metropolises.',
      bookWizz: 'Book on WizzAir.com',
      airportSite: 'Official TZL Airport Website',
      taxiHeader: 'Licensed Radio Taxi Dispatch',
      taxiSub: 'Official taxis in Tuzla operate with calibrated taximeters. Standard airport to city center fare is ~30–40 BAM (€15–20).',
      callNow: 'Call Dispatch Now',
      rentacarHeader: 'Car Rental at TZL Terminal',
      rentacarSub: 'Car rental desks are located inside the arrivals hall of Tuzla Airport. Advance booking is recommended during peak season.',
      callAgency: 'Call Agency',
      emailAgency: 'Send Email',
      intlBusHeader: 'Intercity & International Bus Lines (Transturist Tuzla)',
      intlBusSub: 'Transturist Tuzla offers daily connections to Sarajevo and major European destinations in Germany and Croatia.',
      bookBuskarta: 'Book Online at Buskarta.ba',
      transturistSite: 'Official Transturist Portal',
      intlTitle: 'International Long-Distance Lines',
      domesticTitle: 'Domestic: Tuzla – Sarajevo',
      domesticDesc: 'Direct connection via Kladanj and Olovo with multiple daily departures on modern coaches.',
      trainBadge: 'Summer Seasonal Attraction',
      trainTitle: 'Tuzla Tourist Sightseeing Train',
      trainSubtitle: 'The tourist mini-train operates in Tuzla, starting from Freedom Square to the Pannonian Lakes from Tuesday to Sunday between 10:00 and 17:00, while Monday is a non-working day (no service). Enjoy a scenic ride through parks and landmarks.',
      trainBoardingTitle: 'Boarding Location',
      trainBoardingPlace: 'Freedom Square (Trg slobode)',
      trainBoardingDesc: 'Official departure and return station is located at Freedom Square, running towards the Pannonian Lakes complex and city park.',
      trainDays: 'Tuesday – Sunday (10:00 – 17:00)',
      trainMonday: 'Monday: Non-working day (does not operate)',
      trainScheduleTitle: 'Schedule & Tour Details',
      trainDeparturesTitle: 'Departures: Every full hour (10:00 to 17:00)',
      trainTicketTitle: 'Ticket Pricing',
      trainSingleTicket: 'Individual Ticket',
      trainSinglePrice: '2.00 BAM (KM)',
      trainSingleDesc: 'Per passenger for one scenic sightseeing loop',
      trainCharterTicket: 'Reserved Charter (Entire Train)',
      trainCharterPrice: '36.00 BAM (KM)',
      trainCharterDesc: 'Exclusive private booking for groups / events (maximum 36 seats)',
      trainSummerNotice: 'Seasonal operation exclusively during the summer period from Tuesday to Sunday. Closed on Mondays.'
    },
    bs: {
      title: 'Prevoz u Tuzli',
      subtitle: 'Glavni saobraćajni vodič: GIPS linije i red vožnje, aerodromski transferi, međugradski busevi, taksi službe i rent-a-car.',
      busesTab: 'Autobusi (GIPS)',
      intlBusTab: 'Međugradski & Međunarodni',
      flightsTab: 'Letovi (TZL)',
      taxiTab: 'Taksi (Poziv)',
      rentacarTab: 'Rent a Car',
      gipsBannerTitle: 'Zvanična mreža gradskog prevoza',
      gipsBannerDesc: 'GIPS d.d. Tuzla upravlja gradskim linijama (Ka, Kb, 2) po cijeni od 1.50 KM i aerodromskim linijama (11, 34) od 2.50 do 5.50 KM. Plaćanje je isključivo u gotovini kod vozača.',
      gipsLiveCta: 'Prati autobus uživo / GIPS red vožnje',
      selectLine: 'Odaberite autobusku liniju:',
      routeTimeline: 'Trasa i ključna stajališta',
      timetableHeader: 'Zvanični red vožnje i polasci',
      workdays: 'Radni dan i Subota',
      sunday: 'Nedjelja i Praznici',
      departuresCount: 'redovnih polazaka dnevno',
      cashNotice: 'Karta se kupuje kod vozača isključivo u gotovini (KM). Pripremite tačan iznos.',
      openGipsWeb: 'Otvori na GIPS portalu',
      flightsHeader: 'Direktni letovi sa Aerodroma Tuzla (TZL)',
      flightsSub: 'Međunarodni aerodrom Tuzla (Dubrave) povezuje Tuzlu i regiju sa vodećim evropskim gradovima preko Wizz Air letova.',
      bookWizz: 'Rezerviši let na WizzAir.com',
      airportSite: 'Zvanična stranica Aerodroma Tuzla',
      taxiHeader: 'Licencirane taksi službe u Tuzli',
      taxiSub: 'Zvanični taksi prevoznici voze po taksimetru. Standardna vožnja između aerodroma i centra grada košta 30–40 KM (€15–20).',
      callNow: 'Pozovi dispečera',
      rentacarHeader: 'Rent-a-car agencije na aerodromu TZL',
      rentacarSub: 'Šalteri rent-a-car agencija nalaze se u zoni dolazaka terminala aerodroma. Preporučuje se rezervacija unaprijed.',
      callAgency: 'Pozovi agenciju',
      emailAgency: 'Pošalji e-mail',
      intlBusHeader: 'Međugradske i međunarodne linije (Transturist Tuzla)',
      intlBusSub: 'Transturist Tuzla povezuje Tuzlu sa Sarajevom i evropskim metropolama u Njemačkoj i Hrvatskoj.',
      bookBuskarta: 'Kupi kartu online na Buskarta.ba',
      transturistSite: 'Zvanična Transturist stranica',
      domesticTitle: 'Domaća linija: Tuzla – Sarajevo',
      domesticDesc: 'Direktna linija preko Kladnja i Olova sa više dnevnih polazaka modernim autobusima.',
      intlTitle: 'Međunarodne linije za Njemačku i Hrvatsku',
      trainBadge: 'Ljetna turistička atrakcija',
      trainTitle: 'Turistički vozić u Tuzli',
      trainSubtitle: 'Turistički vozić u Tuzli polazi sa Trga slobode prema Panonskim jezerima i saobraća od utorka do nedjelje u terminima od 10:00 do 17:00 sati, dok je ponedjeljak neradni dan (ne vozi). Uživajte u panoramskoj vožnji kroz uži centar grada, parkove i turističke lokalitete.',
      trainBoardingTitle: 'Mjesto polaska i ukrcaja',
      trainBoardingPlace: 'Trg slobode (Freedom Square)',
      trainBoardingDesc: 'Zvanična početna i povratna stanica vozića nalazi se na Trgu slobode, sa rutom prema kompleksu Panonskih jezera i Gradskom parku.',
      trainDays: 'Od utorka do nedjelje (10:00 – 17:00 sati)',
      trainMonday: 'Ponedjeljak: Neradni dan (ne vozi)',
      trainScheduleTitle: 'Raspored i detalji vožnje',
      trainDeparturesTitle: 'Polasci: Svakog punog sata (od 10:00 do 17:00)',
      trainTicketTitle: 'Cijena karte',
      trainSingleTicket: 'Pojedinačna karta',
      trainSinglePrice: '2,00 KM',
      trainSingleDesc: 'Po osobi za jednu panoramsku vožnju',
      trainCharterTicket: 'Rezervisana vožnja (cijena cijelog vozića/ture)',
      trainCharterPrice: '36,00 KM',
      trainCharterDesc: 'Zakup cijelog vozića za grupe, rođendane i ekskurzije (maksimalno 36 sjedišta)',
      trainSummerNotice: 'Turistički vozić vozi isključivo tokom ljetne sezone od utorka do nedjelje. Ponedjeljkom ne saobraća.'
    },
    de: {
      title: 'Verkehr & Mobilität Tuzla',
      subtitle: 'Kompletter Nahverkehrsführer: GIPS-Buslinien mit Fahrplan, Fernbusse, Flughafen TZL, Taxis und Mietwagen.',
      busesTab: 'Busse (GIPS)',
      intlBusTab: 'Fern- & Int. Busse',
      flightsTab: 'Flüge (TZL)',
      taxiTab: 'Taxis (Anruf)',
      rentacarTab: 'Mietwagen',
      gipsBannerTitle: 'Offizielles Liniennetz GIPS Tuzla',
      gipsBannerDesc: 'GIPS d.d. Tuzla bedient Stadtlinien (Ka, Kb, 2) für 1.50 BAM sowie Flughafenbusse (11, 34) für 2.50–5.50 BAM. Barzahlung im Bus.',
      gipsLiveCta: 'Live-Busverfolgung & GIPS Fahrplan',
      selectLine: 'Buslinie wählen:',
      routeTimeline: 'Strecke & wichtige Haltestellen',
      timetableHeader: 'Offizieller Fahrplan & Abfahrten',
      workdays: 'Werktag & Samstag',
      sunday: 'Sonntag & Feiertage',
      departuresCount: 'geplante Abfahrten täglich',
      cashNotice: 'Fahrkarten werden beim Fahrer ausschließlich in bar (BAM) bezahlt.',
      openGipsWeb: 'Auf GIPS-Portal ansehen',
      flightsHeader: 'Direktflüge ab Flughafen Tuzla (TZL)',
      flightsSub: 'Der Flughafen Tuzla verbindet Nordostbosnien direkt mit zahlreichen Großstädten in Deutschland, der Schweiz, Schweden u.a.',
      bookWizz: 'Auf WizzAir.com buchen',
      airportSite: 'Flughafen Tuzla Website',
      taxiHeader: 'Lizenzierte Taxiunternehmen in Tuzla',
      taxiSub: 'Taxis fahren mit geeichten Taxametern. Eine Fahrt vom Flughafen ins Zentrum kostet ca. 30–40 BAM (15–20 €).',
      callNow: 'Taxi jetzt anrufen',
      rentacarHeader: 'Mietwagen am Flughafen TZL',
      rentacarSub: 'Mietwagenschalter befinden sich direkt in der Ankunftshalle des Flughafens Tuzla.',
      callAgency: 'Agentur anrufen',
      emailAgency: 'E-Mail senden',
      intlBusHeader: 'Fern- & Auslandsbusse (Transturist Tuzla)',
      intlBusSub: 'Komfortable Verbindungen nach Sarajevo sowie nach Deutschland und Kroatien.',
      bookBuskarta: 'Online buchen auf Buskarta.ba',
      transturistSite: 'Transturist Webseite',
      domesticTitle: 'Inland: Tuzla – Sarajevo',
      domesticDesc: 'Direkte Verbindung über Kladanj und Olovo mit täglichen Abfahrten.',
      intlTitle: 'Internationale Linien',
      trainBadge: 'Sommer-Saison-Attraktion',
      trainTitle: 'Touristischer Bummelzug Tuzla',
      trainSubtitle: 'Der touristische Bummelzug in Tuzla startet am Freiheitsplatz (Trg slobode) in Richtung Pannonische Seen und verkehrt in der Sommersaison von Dienstag bis Sonntag zwischen 10:00 und 17:00 Uhr. Montags ist Ruhetag (fährt nicht).',
      trainBoardingTitle: 'Abfahrtsort & Einstieg',
      trainBoardingPlace: 'Freiheitsplatz (Trg slobode)',
      trainBoardingDesc: 'Die Hauptabfahrtshaltestelle befindet sich am Trg slobode und führt zu den Pannonischen Seen und dem Stadtpark.',
      trainDays: 'Dienstag – Sonntag (10:00 – 17:00 Uhr)',
      trainMonday: 'Montag: Ruhetag (fährt nicht)',
      trainScheduleTitle: 'Fahrplan & Tour-Details',
      trainDeparturesTitle: 'Abfahrten: Zu jeder vollen Stunde (von 10:00 bis 17:00 Uhr)',
      trainTicketTitle: 'Fahrpreise',
      trainSingleTicket: 'Einzelfahrkarte',
      trainSinglePrice: '2,00 KM (BAM)',
      trainSingleDesc: 'Pro Person für eine Rundfahrt',
      trainCharterTicket: 'Reservierte Exklusivfahrt (Gesamter Zug)',
      trainCharterPrice: '36,00 KM (BAM)',
      trainCharterDesc: 'Komplette Buchung für Gruppen und Anlässe (maximal 36 Sitzplätze)',
      trainSummerNotice: 'Verkehrt ausschließlich während der Sommersaison von Dienstag bis Sonntag. Montags kein Betrieb.'
    },
    tr: {
      title: 'Tuzla Ulaşım Rehberi',
      subtitle: 'Şehir içi GIPS otobüs hatları, şehirlerarası otobüsler, TZL Havalimanı uçuşları, resmi taksiler ve araç kiralama.',
      busesTab: 'Otobüsler (GIPS)',
      intlBusTab: 'Şehirlerarası & Uluslararası',
      flightsTab: 'Uçuşlar (TZL)',
      taxiTab: 'Taksiler (Ara)',
      rentacarTab: 'Araç Kiralama',
      gipsBannerTitle: 'Resmi Şehir İçi Otobüs Ağı',
      gipsBannerDesc: 'GIPS d.d. Tuzla şehir hatları (Ka, Kb, 2) 1.50 KM, havalimanı ekspres hatları (11, 34) 2.50–5.50 KM\'dir. Sadece nakit KM kabul edilir.',
      gipsLiveCta: 'Canlı Otobüs Takibi / GIPS Seferleri',
      selectLine: 'Otobüs Hattı Seçin:',
      routeTimeline: 'Güzergah ve Duraklar',
      timetableHeader: 'Resmi Hareket Saatleri',
      workdays: 'Hafta İçi ve Cumartesi',
      sunday: 'Pazar ve Tatil Günleri',
      departuresCount: 'günlük tarifeli sefer',
      cashNotice: 'Biletler otobüse binerken şoförden sadece nakit KM ile alınır.',
      openGipsWeb: 'GIPS Sitesinde Aç',
      flightsHeader: 'Tuzla Havalimanı (TZL) Direkt Uçuşları',
      flightsSub: 'Tuzla Uluslararası Havalimanı (Dubrave), Wizz Air ile Avrupa\'nın ana merkezlerine doğrudan uçuşlar sunar.',
      bookWizz: 'WizzAir.com\'dan Bilet Al',
      airportSite: 'Tuzla Havalimanı Resmi Sitesi',
      taxiHeader: 'Tuzla Lisanslı Taksi Durakları',
      taxiSub: 'Resmi taksiler taksimetre ile çalışır. Havalimanı ile şehir merkezi arası yaklaşık 30–40 KM (15–20 €) tutar.',
      callNow: 'Hemen Taksi Çağır',
      rentacarHeader: 'TZL Havalimanında Araç Kiralama',
      rentacarSub: 'Kiralama ofisleri Tuzla Havalimanı gelen yolcu terminalindedir. Önceden rezervasyon önerilir.',
      callAgency: 'Acenteyi Ara',
      emailAgency: 'E-posta Gönder',
      intlBusHeader: 'Şehirlerarası & Uluslararası Otobüsler (Transturist)',
      intlBusSub: 'Transturist Tuzla ile Saraybosna\'ya ve Almanya ile Hırvatistan\'a konforlu otobüs hatları.',
      bookBuskarta: 'Buskarta.ba\'dan Online Bilet Al',
      transturistSite: 'Transturist Resmi Sitesi',
      domesticTitle: 'Yurtiçi: Tuzla – Saraybosna',
      domesticDesc: 'Kladanj ve Olovo üzerinden Saraybosna\'ya günlük seferler.',
      intlTitle: 'Uluslararası Seferler',
      trainBadge: 'Yaz Sezonluk Eğlence Treni',
      trainTitle: 'Tuzla Turistik Gezi Treni',
      trainSubtitle: 'Tuzla Turistik Gezi Treni Trg slobode\'den (Özgürlük Meydanı) Panonika Gölleri\'ne doğru hareket eder ve yaz aylarında Salı\'dan Pazar\'a 10:00 - 17:00 saatleri arasında sefer yapar; Pazartesi günleri tatildir (çalışmaz).',
      trainBoardingTitle: 'Biniş ve Kalkış Noktası',
      trainBoardingPlace: 'Trg slobode (Özgürlük Meydanı)',
      trainBoardingDesc: 'Resmi kalkış ve dönüş durağı Trg slobode\'dedir; güzergah Panonika Gölleri ve şehir parkı yönündedir.',
      trainDays: 'Salı – Pazar (10:00 – 17:00 saatleri arası)',
      trainMonday: 'Pazartesi: Tatil günü (çalışmamaktadır)',
      trainScheduleTitle: 'Sefer Tarifesi ve Tur Detayları',
      trainDeparturesTitle: 'Kalkışlar: Her saat başı (10:00 - 17:00 arası)',
      trainTicketTitle: 'Bilet Fiyatları',
      trainSingleTicket: 'Tek Kişilik Bilet',
      trainSinglePrice: '2,00 KM',
      trainSingleDesc: 'Kişi başı tek panoramik tur',
      trainCharterTicket: 'Özel Rezervasyon (Tüm Tren / Tur)',
      trainCharterPrice: '36,00 KM',
      trainCharterDesc: 'Gruplar ve etkinlikler için tüm tren kiralama (maksimum 36 koltuk)',
      trainSummerNotice: 'Yalnızca yaz döneminde Salı\'dan Pazar\'a kadar çalışır. Pazartesi günleri kapalıdır.'
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
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            {currentT.title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
            {currentT.subtitle}
          </p>
        </div>
      </div>

      {/* 2. MAIN SEGMENT SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
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
          onClick={() => setActiveSection('internationalBus')}
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all shadow-sm ${activeSection === 'internationalBus'
            ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30 shadow-md ring-2 ring-blue-400/40'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>{currentT.intlBusTab}</span>
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
          {/* GRADSKI PARKING TUZLA – PARTNERSHIP BANNER */}
          <a
            href="https://gradskiparkingtuzla.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-4 w-full rounded-2xl px-5 py-4
              bg-[#2563EB] text-white
              shadow-[0_6px_0_0_#1741a6]
              active:shadow-[0_2px_0_0_#1741a6] active:translate-y-1
              hover:bg-[#1d57d8] hover:shadow-[0_6px_0_0_#1235a0]
              transition-all duration-150 ease-out cursor-pointer select-none"
          >
            {/* White square "P" badge */}
            <div className="shrink-0 w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <span className="text-[#2563EB] font-black text-2xl leading-none tracking-tighter">P</span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm sm:text-base leading-tight">Gradski Parking Tuzla</div>
              <div className="text-blue-200 text-xs font-medium mt-0.5 truncate">Pronađi slobodno parking mjesto · gradskiparkingtuzla.vercel.app</div>
            </div>

            {/* Arrow */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </a>

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

          {/* SPECIAL FEATURE: SIGHTSEEING TOURIST MINI-TRAIN (TURISTIČKI VOZIĆ - LJETNA ATRAKCIJA) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/70 p-6 sm:p-8 shadow-md space-y-6">
            {/* Ambient decorative background glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-300/40 to-orange-400/30 rounded-full blur-2xl pointer-events-none" />

            {/* Header with badges */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{currentT.trainBadge}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-blue-900 text-xs font-bold border border-amber-300 shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{currentT.trainBoardingPlace}</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <span>{currentT.trainTitle}</span>
                  <span className="text-xl">🚂</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
                  {currentT.trainSubtitle}
                </p>
              </div>

              {/* Operating status badge */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-1.5 shrink-0">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{currentT.trainDays}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200/80 text-slate-700 text-[11px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentT.trainMonday}</span>
                </div>
              </div>
            </div>

            {/* BOARDING LOCATION (MJESTO POLASKA: TRG SLOBODE) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-4.5 rounded-2xl bg-white/95 border-2 border-amber-200 shadow-sm">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    {currentT.trainBoardingTitle}
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 flex flex-wrap items-center gap-2">
                    <span>{currentT.trainBoardingPlace}</span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {lang === 'bs' ? 'Polazak & Povratak' : 'Departure & Return'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {currentT.trainBoardingDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* DEPARTURES MATRIX (Svakog punog sata od 10:00 do 17:00) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{currentT.trainDeparturesTitle}</span>
                </h4>
                <span className="text-xs font-bold text-amber-800/80">
                  8 {lang === 'bs' ? 'polazaka dnevno' : 'departures daily'} (10:00 – 17:00)
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                  <div
                    key={time}
                    className="p-3 rounded-2xl bg-white/90 border-2 border-amber-200 text-center font-mono font-black text-xs sm:text-sm text-slate-900 shadow-sm hover:border-amber-400 hover:bg-amber-100/60 transition-all"
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* TICKET PRICING CARDS */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-600" />
                <span>{currentT.trainTicketTitle}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Individual ticket */}
                <div className="rounded-2xl bg-white/95 border-2 border-amber-200 p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        {currentT.trainSingleTicket}
                      </span>
                      <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
                        <Ticket className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-950 mt-1">
                      {currentT.trainSinglePrice}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {currentT.trainSingleDesc}
                  </p>
                </div>

                {/* Charter private train */}
                <div className="rounded-2xl bg-gradient-to-br from-white via-amber-50/40 to-orange-50/50 border-2 border-orange-200 p-4 sm:p-5 shadow-sm space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-900">
                        {currentT.trainCharterTicket}
                      </span>
                      <span className="p-1.5 rounded-xl bg-orange-100 text-orange-700">
                        <Users className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-950 mt-1">
                      {currentT.trainCharterPrice}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {currentT.trainCharterDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom seasonal notice */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-200/50 border border-amber-300 text-xs text-amber-950 font-medium">
              <Sun className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{currentT.trainSummerNotice}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION 2: INTERCITY & INTERNATIONAL BUSES (TRANSTURIST) */}
      {activeSection === 'internationalBus' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white space-y-4 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-cyan-400/30">
              <Globe className="w-3.5 h-3.5" />
              <span>Transturist Tuzla d.d.</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentT.intlBusHeader}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {currentT.intlBusSub}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://buskarta.ba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 uppercase tracking-wider"
              >
                <span>{currentT.bookBuskarta}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.transturist.ba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-xs sm:text-sm font-black transition-all border border-white/20 active:scale-95"
              >
                <span>{currentT.transturistSite}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Domestic line: Tuzla - Sarajevo */}
          <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-black uppercase tracking-wider">
                Domaća ekspres linija
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Transturist d.d.
              </span>
            </div>
            <h4 className="text-xl font-black text-slate-900">{currentT.domesticTitle}</h4>
            <p className="text-xs sm:text-sm text-slate-600">{currentT.domesticDesc}</p>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                <span>Polazak Tuzla</span>
                <span>Dolazak Sarajevo</span>
                <span>Dani vožnje</span>
              </div>
              {INTERNATIONAL_BUS_LINES[0].departures.map((dep, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 text-xs sm:text-sm py-1.5 border-b border-slate-100">
                  <span className="font-black text-slate-800">{dep.time}</span>
                  <span className="text-slate-600">{INTERNATIONAL_BUS_LINES[0].arrivalTimes[idx]}</span>
                  <span className="text-slate-500">{dep.days}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
              <div className="text-slate-600">
                <span className="font-bold">Trajanje:</span> {INTERNATIONAL_BUS_LINES[0].duration} &nbsp;|&nbsp;
                <span className="font-bold">Cijena:</span> {INTERNATIONAL_BUS_LINES[0].price}
              </div>
              <a
                href={INTERNATIONAL_BUS_LINES[0].bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline"
              >
                <span>Rezervacija na Buskarta.ba</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* International Lines Grid */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>{currentT.intlTitle}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERNATIONAL_BUS_LINES.slice(1).map((line) => (
                <div
                  key={line.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-slate-900 text-base">{line.route}</h5>
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg font-bold">
                        {line.duration}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">via {line.via}</p>
                    <p className="text-xs text-slate-600">
                      {line.description[lang] || line.description.en}
                    </p>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100">
                      <div className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Polasci iz Tuzle:</div>
                      {line.departures.map((dep, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700">
                          <span className="font-mono font-black">{dep.time}</span>
                          <span className="text-slate-500 text-[11px]">{dep.days}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{line.carrier}</span>
                    <a
                      href={line.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-black transition-all"
                    >
                      <span>Rezerviši</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-xs text-slate-700 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Za detaljne informacije o peronima i polascima, posjetite <a href="https://buskarta.ba" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">buskarta.ba</a> ili kontaktirajte dispečerski centar Transturist Tuzla na <a href="tel:+38735320325" className="font-bold text-blue-700 hover:underline">+387 35 320-325</a>.
            </p>
          </div>
        </div>
      )}

      {/* 5. SECTION 3: FLIGHTS (TZL AIRPORT) */}
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

      {/* 6. SECTION 4: TAXI SERVICES (WITH DIRECT CALL HOOKS) */}
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

      {/* 7. SECTION 5: RENT-A-CAR (WITH DIRECT CALL & CONTACT HOOKS) */}
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
    </div>
  );
};

export default Transportation;
