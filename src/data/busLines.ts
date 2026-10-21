// Bus Lines Data for Tuzla
// Extracted from the official Tuzla bus transportation website

export interface BusLine {
  id: string;
  lineNumber: string;
  route: string;
  startPoint: string;
  endPoint: string;
  startTime: string;
  endTime: string;
  frequency: string; // e.g., "~60 min"
  isActive: boolean;
  color?: string;
  category?: 'urban' | 'suburban' | 'intercity';
  description?: {
    en: string;
    bs: string;
    de?: string;
    tr?: string;
  };
  stops?: string[];
}

export interface BusStop {
  id: string;
  name: string;
  lines: string[]; // Array of line numbers that stop here
  latitude?: number;
  longitude?: number;
}

export interface BusMenuItem {
  id: string;
  label: {
    en: string;
    bs: string;
    de: string;
    tr: string;
  };
  icon?: string;
  path: string;
  description?: {
    en: string;
    bs: string;
    de?: string;
    tr?: string;
  };
}

// All Tuzla bus lines
export const TUZLA_BUS_LINES: BusLine[] = [
  // Active Urban Lines (visible in grid)
  {
    id: '1',
    lineNumber: '1',
    route: 'Grabovica - Krojcica',
    startPoint: 'Grabovica',
    endPoint: 'Krojcica',
    startTime: '06:15',
    endTime: '21:10',
    frequency: '~75 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban',
    description: {
      en: 'Urban line connecting Grabovica to Krojcica',
      bs: 'Gradska linija koja povezuje Grabovicu i Krojcicu',
      de: 'Stadtlinie, die Grabovica mit Krojcica verbindet',
      tr: 'Grabovica ve Krojcica arasındaki şehir içi hattı'
    }
  },
  {
    id: '3',
    lineNumber: '3',
    route: 'Moluhe - B.Gradina',
    startPoint: 'Moluhe',
    endPoint: 'B.Gradina',
    startTime: '05:30',
    endTime: '21:35',
    frequency: '~60 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban',
    description: {
      en: 'Urban line connecting Moluhe to B.Gradina',
      bs: 'Gradska linija koja povezuje Moluhe i B.Gradinu',
      de: 'Stadtlinie, die Moluhe mit B.Gradina verbindet',
      tr: 'Moluhe ve B.Gradina arasındaki şehir içi hattı'
    }
  },
  {
    id: '6',
    lineNumber: '6',
    route: 'Mandici - Ši Selo',
    startPoint: 'Mandici',
    endPoint: 'Ši Selo',
    startTime: '06:00',
    endTime: '21:00',
    frequency: '~65 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban',
    description: {
      en: 'Urban line connecting Mandici to Ši Selo',
      bs: 'Gradska linija koja povezuje Mandice i Ši Selo',
      de: 'Stadtlinie, die Mandici mit Ši Selo verbindet',
      tr: 'Mandici ve Ši Selo arasındaki şehir içi hattı'
    }
  },
  {
    id: '9A',
    lineNumber: '9A',
    route: 'Puracic - Tuzla AS istok',
    startPoint: 'Puracic',
    endPoint: 'Tuzla AS istok',
    startTime: '05:30',
    endTime: '22:00',
    frequency: '~50 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban',
    description: {
      en: 'Urban line from Puracic to Tuzla East Bus Station',
      bs: 'Gradska linija od Puracića do Autobuske stanice Tuzla Istok',
      de: 'Stadtlinie von Puracic zum Busbahnhof Tuzla Ost',
      tr: 'Puracic ve Tuzla Doğu Otobüs Terminali arasındaki şehir içi hattı'
    }
  },
  {
    id: '9B',
    lineNumber: '9B',
    route: 'Gracanica AS - Tuzla AS Istok',
    startPoint: 'Gracanica AS',
    endPoint: 'Tuzla AS Istok',
    startTime: '05:20',
    endTime: '20:30',
    frequency: '~30 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban',
    description: {
      en: 'Urban line from Gracanica Bus Station to Tuzla East Bus Station',
      bs: 'Gradska linija od Autobuske stanice Gračanica do Autobuske stanice Tuzla Istok',
      de: 'Stadtlinie vom Busbahnhof Gracanica zum Busbahnhof Tuzla Ost',
      tr: 'Gracanica Otobüs Terminali ve Tuzla Doğu Otobüs Terminali arasındaki şehir içi hattı'
    }
  },
  {
    id: '10A',
    lineNumber: '10A',
    route: 'Živinice AS - Tuzla AS',
    startPoint: 'Živinice AS',
    endPoint: 'Tuzla AS',
    startTime: '06:10',
    endTime: '22:00',
    frequency: '~20 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'suburban',
    description: {
      en: 'Suburban line from Živinice to Tuzla Bus Station',
      bs: 'Prigradska linija od Živinica do Autobuske stanice Tuzla',
      de: 'Vorortlinie von Živinice zum Busbahnhof Tuzla',
      tr: 'Živinice ve Tuzla Otobüs Terminali arasındaki banliyö hattı'
    }
  },
  {
    id: '10B',
    lineNumber: '10B',
    route: 'Banovici AS - Tuzla AS',
    startPoint: 'Banovici AS',
    endPoint: 'Tuzla AS',
    startTime: '05:35',
    endTime: '19:05',
    frequency: '~35 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'suburban',
    description: {
      en: 'Suburban line from Banovici to Tuzla Bus Station',
      bs: 'Prigradska linija od Banovića do Autobuske stanice Tuzla',
      de: 'Vorortlinie von Banovici zum Busbahnhof Tuzla',
      tr: 'Banovici ve Tuzla Otobüs Terminali arasındaki banliyö hattı'
    }
  },
  {
    id: '10C',
    lineNumber: '10C',
    route: 'Kladanj AS - Tuzla AS',
    startPoint: 'Kladanj AS',
    endPoint: 'Tuzla AS',
    startTime: '05:10',
    endTime: '20:30',
    frequency: '~115 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'intercity',
    description: {
      en: 'Intercity line from Kladanj to Tuzla Bus Station',
      bs: 'Međugradska linija od Kladanja do Autobuske stanice Tuzla',
      de: 'Stadtverbindungslinie von Kladanj zum Busbahnhof Tuzla',
      tr: 'Kladanj ve Tuzla Otobüs Terminali arasındaki şehirlerarası hattı'
    }
  },
  {
    id: '11',
    lineNumber: '11',
    route: 'Tuzla - Kalesija',
    startPoint: 'Tuzla',
    endPoint: 'Kalesija',
    startTime: '05:55',
    endTime: '18:55',
    frequency: '~65 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'suburban',
    description: {
      en: 'Suburban line from Tuzla to Kalesija',
      bs: 'Prigradska linija od Tuzle do Kalesije',
      de: 'Vorortlinie von Tuzla nach Kalesija',
      tr: 'Tuzla ve Kalesija arasındaki banliyö hattı'
    }
  },
  {
    id: '13A',
    lineNumber: '13A',
    route: 'Kalesija - Tuzla',
    startPoint: 'Kalesija',
    endPoint: 'Tuzla',
    startTime: '05:35',
    endTime: '19:00',
    frequency: '~38 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'suburban',
    description: {
      en: 'Suburban line from Kalesija to Tuzla',
      bs: 'Prigradska linija od Kalesije do Tuzle',
      de: 'Vorortlinie von Kalesija nach Tuzla',
      tr: 'Kalesija ve Tuzla arasındaki banliyö hattı'
    }
  },
  {
    id: '13B',
    lineNumber: '13B',
    route: 'Sapna - Tuzla',
    startPoint: 'Sapna',
    endPoint: 'Tuzla',
    startTime: '05:15',
    endTime: '15:15',
    frequency: '~120 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'suburban',
    description: {
      en: 'Suburban line from Sapna to Tuzla',
      bs: 'Prigradska linija od Sapne do Tuzle',
      de: 'Vorortlinie von Sapna nach Tuzla',
      tr: 'Sapna ve Tuzla arasındaki banliyö hattı'
    }
  },
  {
    id: '14',
    lineNumber: '14',
    route: 'Kiseljak - Slavinovici',
    startPoint: 'Kiseljak',
    endPoint: 'Slavinovici',
    startTime: '05:30',
    endTime: '21:55',
    frequency: '~60 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban',
    description: {
      en: 'Urban line from Kiseljak to Slavinovici',
      bs: 'Gradska linija od Kiseljaka do Slavinovica',
      de: 'Stadtlinie von Kiseljak nach Slavinovici',
      tr: 'Kiseljak ve Slavinovici arasındaki şehir içi hattı'
    }
  },
  // Additional Active Lines
  {
    id: '18',
    lineNumber: '18',
    route: 'Gornja Lipnica - Slavinovici',
    startPoint: 'Gornja Lipnica',
    endPoint: 'Slavinovici',
    startTime: '05:35',
    endTime: '22:00',
    frequency: '~65 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban'
  },
  {
    id: '19',
    lineNumber: '19',
    route: 'Mramor - Solina',
    startPoint: 'Mramor',
    endPoint: 'Solina',
    startTime: '05:55',
    endTime: '22:10',
    frequency: '~60 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban'
  },
  {
    id: '20',
    lineNumber: '20',
    route: 'Poljice - Tuzla AS Istok',
    startPoint: 'Poljice',
    endPoint: 'Tuzla AS Istok',
    startTime: '05:40',
    endTime: '19:00',
    frequency: '~80 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'urban'
  },
  {
    id: '24A',
    lineNumber: '24A',
    route: 'AS Srebrenik - Tuzla AS Istok',
    startPoint: 'AS Srebrenik',
    endPoint: 'Tuzla AS Istok',
    startTime: '05:20',
    endTime: '22:25',
    frequency: '~40 min',
    isActive: true,
    color: '#1d4ed8',
    category: 'suburban'
  },
  // Less Active / Regional Lines
  {
    id: '27',
    lineNumber: '27',
    route: 'Gracanica AS - Lukavica (Dom kulture)',
    startPoint: 'Gracanica AS',
    endPoint: 'Lukavica (Dom kulture)',
    startTime: '06:25',
    endTime: '19:25',
    frequency: '~85 min',
    isActive: false,
    color: '#6b7280',
    category: 'intercity'
  },
  {
    id: '30',
    lineNumber: '30',
    route: 'Obodnica Donja - Ši Selo',
    startPoint: 'Obodnica Donja',
    endPoint: 'Ši Selo',
    startTime: '05:45',
    endTime: '20:00',
    frequency: '~153 min',
    isActive: false,
    color: '#6b7280',
    category: 'urban'
  },
  {
    id: '31',
    lineNumber: '31',
    route: 'Gornji Pasci - Solina',
    startPoint: 'Gornji Pasci',
    endPoint: 'Solina',
    startTime: '05:40',
    endTime: '22:05',
    frequency: '~60 min',
    isActive: false,
    color: '#6b7280',
    category: 'urban'
  },
  {
    id: '32',
    lineNumber: '32',
    route: 'Kozlovac - Ši Selo',
    startPoint: 'Kozlovac',
    endPoint: 'Ši Selo',
    startTime: '06:30',
    endTime: '17:30',
    frequency: '~95 min',
    isActive: false,
    color: '#6b7280',
    category: 'urban'
  },
  {
    id: '33',
    lineNumber: '33',
    route: 'Celic - Tuzla AS Zapad',
    startPoint: 'Celic',
    endPoint: 'Tuzla AS Zapad',
    startTime: '05:40',
    endTime: '18:30',
    frequency: '~90 min',
    isActive: false,
    color: '#6b7280',
    category: 'urban'
  },
  {
    id: '34',
    lineNumber: '34',
    route: 'Aerodrom Tuzla - Tuzla AS Istok',
    startPoint: 'Aerodrom Tuzla',
    endPoint: 'Tuzla AS Istok',
    startTime: '07:00',
    endTime: '23:00',
    frequency: '~120 min',
    isActive: false,
    color: '#6b7280',
    category: 'urban'
  },
  // Lukavac and Regional Lines
  {
    id: '40',
    lineNumber: '40',
    route: 'Jaruke - Lukavac AS',
    startPoint: 'Jaruke',
    endPoint: 'Lukavac AS',
    startTime: '05:40',
    endTime: '18:00',
    frequency: '~240 min',
    isActive: false,
    color: '#6b7280',
    category: 'intercity'
  },
  {
    id: '44',
    lineNumber: '44',
    route: 'Orahovica - Lukavac AS',
    startPoint: 'Orahovica',
    endPoint: 'Lukavac AS',
    startTime: '05:45',
    endTime: '17:50',
    frequency: '~175 min',
    isActive: false,
    color: '#6b7280',
    category: 'intercity'
  },
  {
    id: '45',
    lineNumber: '45',
    route: 'Turija - Lukavac',
    startPoint: 'Turija',
    endPoint: 'Lukavac',
    startTime: '05:40',
    endTime: '16:10',
    frequency: '~130 min',
    isActive: false,
    color: '#6b7280',
    category: 'intercity'
  },
  {
    id: '47',
    lineNumber: '47',
    route: 'Bokavici - Lukavac AS',
    startPoint: 'Bokavici',
    endPoint: 'Lukavac AS',
    startTime: '06:25',
    endTime: '19:20',
    frequency: '~173 min',
    isActive: false,
    color: '#6b7280',
    category: 'intercity'
  },
  {
    id: '49',
    lineNumber: '49',
    route: 'Prline - Lukavac AS',
    startPoint: 'Prline',
    endPoint: 'Lukavac AS',
    startTime: '06:10',
    endTime: '18:00',
    frequency: '~175 min',
    isActive: false,
    color: '#6b7280',
    category: 'intercity'
  },
  {
    id: '52',
    lineNumber: '52',
    route: 'Kovacica - Paš Bunar',
    startPoint: 'Kovacica',
    endPoint: 'Paš Bunar',
    startTime: '05:30',
    endTime: '16:00',
    frequency: '~98 min',
    isActive: false,
    color: '#6b7280',
    category: 'urban'
  }
];

// Bus menu items for navigation
export const BUS_MENU_ITEMS: BusMenuItem[] = [
  {
    id: 'red-voznje',
    label: {
      en: 'Timetable',
      bs: 'Red vožnje',
      de: 'Fahrplan',
      tr: 'Zaman Çizelgesi'
    },
    path: '/bus/timetable',
    icon: 'clock',
    description: {
      en: 'View all bus departure times and schedules',
      bs: 'Pogledajte sva vremena polaska autobusa i rasporede',
      de: 'Alle Abfahrtszeiten und Fahrpläne anzeigen',
      tr: 'Tüm otobüs kalkış saatlerini ve programlarını görüntüleyin'
    }
  },
  {
    id: 'stajalista',
    label: {
      en: 'Stops',
      bs: 'Stajališta',
      de: 'Haltestellen',
      tr: 'Duraklar'
    },
    path: '/bus/stops',
    icon: 'map-pin',
    description: {
      en: 'Find all bus stops and which lines serve them',
      bs: 'Pronađite sva stajališta i koje linije tamo saobraćaju',
      de: 'Finden Sie alle Bushaltestellen und welche Linien dort halten',
      tr: 'Tüm otobüs duraklarını ve hangi hatların orada durduğunu bulun'
    }
  },
  {
    id: 'mapa-linija',
    label: {
      en: 'Route Map',
      bs: 'Mapa linija',
      de: 'Liniennetzplan',
      tr: 'Hat Haritası'
    },
    path: '/bus/map',
    icon: 'map',
    description: {
      en: 'Interactive map showing all bus routes',
      bs: 'Interaktivna mapa koja prikazuje sve autobske rute',
      de: 'Interaktive Karte mit allen Busrouten',
      tr: 'Tüm otobüs güzergahlarını gösteren etkileşimli harita'
    }
  },
  {
    id: 'planer',
    label: {
      en: 'Planner',
      bs: 'Planer',
      de: 'Fahrplaner',
      tr: 'Planlayıcı'
    },
    path: '/bus/planner',
    icon: 'calendar',
    description: {
      en: 'Plan your journey with the trip planner',
      bs: 'Planirajte svoje putovanje pomoću planera putovanja',
      de: 'Planen Sie Ihre Reise mit dem Reiseplaner',
      tr: 'Seyahat planlayıcısı ile yolculuğunuzu planlayın'
    }
  },
  {
    id: 'relacije',
    label: {
      en: 'Connections',
      bs: 'Relacije',
      de: 'Verbindungen',
      tr: 'Bağlantılar'
    },
    path: '/bus/connections',
    icon: 'link',
    description: {
      en: 'View connections between different locations',
      bs: 'Pogledajte veze između različitih lokacija',
      de: 'Verbindungen zwischen verschiedenen Orten anzeigen',
      tr: 'Farklı konumlar arasındaki bağlantılar görüntüleyin'
    }
  },
  {
    id: 'trenutni-status',
    label: {
      en: 'Current Status',
      bs: 'Trenutni status',
      de: 'Aktueller Status',
      tr: 'Mevcut Durum'
    },
    path: '/bus/status',
    icon: 'activity',
    description: {
      en: 'Real-time information about delays and cancellations',
      bs: 'Informacije u realnom vremenu o kašnjenjima i otkazivanjima',
      de: 'Echtzeit-Informationen zu Verspätungen und Ausfällen',
      tr: 'Gecikmeler ve iptaller hakkında gerçek zamanlı bilgiler'
    }
  },
  {
    id: 'izmene',
    label: {
      en: 'Changes',
      bs: 'Izmene',
      de: 'Änderungen',
      tr: 'Değişiklikler'
    },
    path: '/bus/changes',
    icon: 'edit',
    description: {
      en: 'Check for any changes to the bus schedules',
      bs: 'Provjerite da li ima ikakvih izmjena u rasporedu autobusa',
      de: 'Auf Änderungen der Busfahrpläne prüfen',
      tr: 'Otobüs programlarındaki değişiklikleri kontrol edin'
    }
  },
  {
    id: 'nocni-povratak',
    label: {
      en: 'Night Return',
      bs: 'Noćni povratak',
      de: 'Nacht Rückkehr',
      tr: 'Gece Dönüş'
    },
    path: '/bus/night',
    icon: 'moon',
    description: {
      en: 'Night bus services for returning home',
      bs: 'Noćne autobuske usluge za povratak kući',
      de: 'Nachtbusse für die Rückfahrt nach Hause',
      tr: 'Eve eve dönüş için otobüs hizmetleri'
    }
  },
  {
    id: 'karte',
    label: {
      en: 'Tickets',
      bs: 'Karte',
      de: 'Tickets',
      tr: 'Biletler'
    },
    path: '/bus/tickets',
    icon: 'ticket',
    description: {
      en: 'Information about bus tickets and fares',
      bs: 'Informacije o autobuskim kartama i tarifama',
      de: 'Informationen zu Bustickets und Tarifen',
      tr: 'Otobüs biletleri ve ücretler hakkında bilgi'
    }
  },
  {
    id: 'vodic',
    label: {
      en: 'Guide',
      bs: 'Vodič',
      de: 'Führer',
      tr: 'Rehber'
    },
    path: '/bus/guide',
    icon: 'book',
    description: {
      en: 'Complete guide to using Tuzla bus services',
      bs: 'Potpun vodič za korištenje usluga autobuskog prevoza u Tuzli',
      de: 'Vollständiger Leitfaden zur Nutzung der Busdienste in Tuzla',
      tr: 'Tuzla otobüs hizmetlerini kullanma hakkında tam rehber'
    }
  },
  {
    id: 'statistika',
    label: {
      en: 'Statistics',
      bs: 'Statistika',
      de: 'Statistiken',
      tr: 'İstatistikler'
    },
    path: '/bus/statistics',
    icon: 'bar-chart',
    description: {
      en: 'Statistics about bus usage and passenger numbers',
      bs: 'Statistike o korištenju autobusa i broju putnika',
      de: 'Statistiken zur Busnutzung und Fahrgastzahlen',
      tr: 'Otobüs kullanımı ve yolcu sayısı hakkında istatistikler'
    }
  }
];

// Helper functions
export const getBusLineById = (id: string): BusLine | undefined => {
  return TUZLA_BUS_LINES.find(line => line.id === id);
};

export const getBusLinesByCategory = (category: 'urban' | 'suburban' | 'intercity'): BusLine[] => {
  return TUZLA_BUS_LINES.filter(line => line.category === category);
};

export const getActiveBusLines = (): BusLine[] => {
  return TUZLA_BUS_LINES.filter(line => line.isActive);
};

export const searchBusLines = (query: string): BusLine[] => {
  const lowerQuery = query.toLowerCase();
  return TUZLA_BUS_LINES.filter(line => 
    line.lineNumber.toLowerCase().includes(lowerQuery) ||
    line.route.toLowerCase().includes(lowerQuery) ||
    line.startPoint.toLowerCase().includes(lowerQuery) ||
    line.endPoint.toLowerCase().includes(lowerQuery)
  );
};

export const getFrequentBusLines = (maxFrequency: number = 60): BusLine[] => {
  return TUZLA_BUS_LINES.filter(line => {
    const freq = parseInt(line.frequency.replace(/[^0-9]/g, ''));
    return !isNaN(freq) && freq <= maxFrequency;
  });
};
