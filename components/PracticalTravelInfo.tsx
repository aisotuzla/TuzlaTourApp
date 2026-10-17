import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Plane,
  Bus,
  ShieldCheck,
  FileCheck2,
  Building,
  HeartPulse,
  PhoneCall,
  Smartphone,
  Wifi,
  Coins,
  ExternalLink,
  MapPin,
  Clock,
  Compass,
  CreditCard,
  CheckCircle2,
  Info,
  CalendarCheck
} from 'lucide-react';
import { Language } from '../types';

interface PracticalTravelInfoProps {
  lang: Language;
  onSwitchToItinerary?: () => void;
}

export const PracticalTravelInfo: React.FC<PracticalTravelInfoProps> = ({
  lang,
  onSwitchToItinerary,
}) => {
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flights' | 'bus' | 'entry' | 'health' | 'simMoney'>('all');

  const content = {
    en: {
      title: 'Practical Travel Guide & Airport Info',
      subtitle: 'Essential advice for flights, transit, border entry, local customs, emergency contacts, and daily logistics in Tuzla.',
      warningBanner: 'Entry rules can change at short notice — verify with your embassy or the B&H Ministry of Foreign Affairs 2–4 weeks before departure.',
      showWarning: 'Show travel entry advisory',
      filters: {
        all: 'All Practical Info',
        flights: '✈️ Flights & TZL',
        bus: '🚌 Bus Lines (34 & 11)',
        entry: '🛂 Entry & Customs',
        health: '🏥 Health & Insurance',
        simMoney: '💡 SIM, Wi-Fi & Money',
      },
      quickItineraryNotice: 'Looking for a structured trip schedule? Check our curated 3-Day Tuzla Itinerary.',
      openItineraryBtn: 'Open 3-Day Plan',
      flights: {
        title: 'Tuzla International Airport (TZL) & Flights',
        badge: 'Target Airport: TZL',
        description: 'Tuzla International Airport (TZL) is the primary gateway to northeastern Bosnia and Herzegovina, served almost exclusively by Wizz Air with convenient European connections.',
        germanyHeading: '🇩🇪 Direct Flights from Germany (Wizz Air seasonal/scheduled)',
        germanyDesc: 'Direct non-stop seasonal flights to TZL operate from four German airports, typically ~2–4 times weekly each, with an average flight time of ≈ 1h 40m:',
        germanyAirports: [
          { code: 'BER', city: 'Berlin Brandenburg', freq: '~2–3 weekly', time: '≈ 1h 40m' },
          { code: 'DTM', city: 'Dortmund', freq: '~2–4 weekly', time: '≈ 1h 45m' },
          { code: 'HAM', city: 'Hamburg', freq: '~2–3 weekly', time: '≈ 1h 50m' },
          { code: 'FMM', city: 'Memmingen / Munich West', freq: '~2–4 weekly', time: '≈ 1h 25m' },
        ],
        otherCountriesHeading: '🇪🇺 Direct Flights from Other Countries',
        otherCountriesDesc: 'Wizz Air regularly connects Tuzla with multiple European destinations:',
        otherCountriesList: [
          { country: '🇸🇪 Sweden', routes: 'Stockholm (NYO), Malmö (MMX), Gothenburg (GOT)' },
          { country: '🇦🇹 Austria', routes: 'Vienna (VIE)' },
          { country: '🇨🇭 Switzerland', routes: 'Basel-Mulhouse-Freiburg (BSL)' },
          { country: '🇸🇰 Slovakia', routes: 'Bratislava (BTS)' },
        ],
        timetableAdvisory: 'Flight frequencies and seasonal schedules change between summer and winter seasons. Always verify current operating dates directly on the official Wizz Air timetable.',
        wizzAirLink: 'Check Wizz Air Timetable',
      },
      bus: {
        title: 'Airport & Regional Transit: Bus Lines 34 & 11',
        badge: 'Bus Transit • Lines 34 & 11',
        priceNotice: 'Ticket Price: Depending on distance, bus fares range from 2.50 KM to 5.50 KM.',
        stats: [
          { label: 'Travel Time', value: '~35–55 min' },
          { label: 'Ticket Price', value: '2.50 – 5.50 KM' },
          { label: 'Payment', value: 'Cash only (KM)' },
          { label: 'Airport Direct', value: 'Line 34 (Direct)' },
        ],
        cashWarning: 'Crucial: Bus drivers accept CASH ONLY in KM. Fares range from 2.50 KM to 5.50 KM depending on distance. Please carry exact change, as drivers cannot accept cards or Euros.',
        taxiAlternative: 'Taxi Alternative: Official taxis wait directly outside arrivals. A trip to downtown Tuzla takes ~20–25 minutes and costs approximately 30–40 BAM (€15–20). Always confirm the fare or taximeter before departing.',
        line34: {
          title: 'Line 34: Tuzla (AS Istok) – B. Malta – Tuzla Airport (Dubrave)',
          badge: 'Direct to Airport Terminal',
          desc: 'This line operates directly to Tuzla International Airport in Dubrave (stops directly at the terminal).',
          days: 'Working days, Saturday and Sunday (Daily departures):',
          toAirportLabel: 'Departures from Tuzla (AS Istok) to Airport:',
          toAirportTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'],
          fromAirportLabel: 'Departures from Airport to Tuzla (AS Istok):',
          fromAirportTimes: ['06:00', '08:00', '10:00 (weekdays also 10:00)', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        },
        line11: {
          title: 'Line 11: Tuzla (AS Istok) – Donje Dubrave – Kalesija (AS)',
          badge: 'Via Dubrave (~800 m to Terminal)',
          desc: 'Passes through Dubrave (stop Donje Dubrave) connecting Tuzla East Bus Station and Kalesija.',
          walkDesc: 'Walk ~800 m (~10 min) from the airport terminal to the main road station in Dubrave.',
          days: 'Working days (during the school year):',
          toKalesijaLabel: 'Departures from Tuzla (AS Istok) to Kalesija via Dubrave:',
          toKalesijaTimes: ['05:55', '07:15', '08:15', '10:15', '11:55', '13:15', '14:45', '15:35', '16:10', '17:20', '18:05', '18:55'],
          toTuzlaLabel: 'Departures from Kalesija to Tuzla via Dubrave:',
          toTuzlaTimes: ['05:30', '06:30', '07:15', '07:45', '08:55', '10:30', '11:40', '12:40', '13:30', '15:05', '16:50', '18:55'],
        },
      },
      entry: {
        title: 'Entry Requirements & Border Procedures (EU & Non-EU)',
        badge: 'Border & Customs Regulations',
        borderProcedures: 'Passport & Border Procedures',
        borderProceduresItems: [
          'Passport stamping: Your passport is stamped upon entry and exit. This is standard procedure and establishes the official entry date for your 90-day visa-free allowance within any 180-day window.',
          'No paper cards: Unlike some non-EU destinations, no paper arrival or departure landing cards are handed out at most land borders or airport gates.',
        ],
        registrationTitle: 'Mandatory 24h Stay Registration (Prijava boravka)',
        hotelReg: 'Hotels & Registered Pansion: The hotel or licensed host registers you with the local authorities automatically upon check-in with your passport.',
        privateReg: 'Private Stays & Airbnbs: If staying with friends, relatives, or in unregistered private rentals, you or your host MUST register your stay in person at the local police station (Policijska uprava) or Service for Foreigners’ Affairs office within 24 hours of arrival.',
        customsTitle: 'Customs Union & Currency Declaration',
        customsDesc: 'Bosnia & Herzegovina is NOT part of the EU Customs Union. Personal baggage, laptops, cameras, phones, and conference equipment enter duty-free without issue.',
        cashRule: 'Currency Declaration: You must declare any physical cash or bearer negotiable instruments exceeding 10,000 KM (approx. €5,000 / $5,500 USD) to customs officers upon entry or exit.',
        specialCasesTitle: 'Special Nationalities & Non-EU Rules',
        ukRule: '🇬🇧 UK Citizens: Visa-free for up to 90 days. A valid passport is strictly required (UK national ID card is not valid for entry).',
        balkansRule: '🇧🇦 / 🇷🇸 / 🇲🇪 / 🇲🇰 / 🇦🇱 Western Balkans: Bilateral agreements allow citizens of Serbia, Montenegro, North Macedonia, and Albania to travel visa-free with a valid biometric national ID card.',
        kosovoRule: '🇽🇰 Kosovo Passport & Stamps: B&H does not officially recognize Kosovo; passport holders are subject to visa regimes. However, historical Kosovo border stamps in foreign/EU passports do not cause refusal of entry into B&H.',
      },
      health: {
        title: 'Health, Medical Insurance & Emergencies',
        badge: 'Important Medical Advice',
        ehicNotice: '⚠️ EHIC Does NOT Apply in Bosnia & Herzegovina',
        ehicDesc: 'The European Health Insurance Card (EHIC) is not valid in Bosnia & Herzegovina. There is no reciprocal state medical coverage for EU visitors.',
        insuranceRecommendation: 'Comprehensive private travel insurance with international medical cover and medical repatriation is strongly recommended before your trip.',
        hospitalTitle: 'Hospitals & Medical Care',
        hospitalDesc: 'UKC Tuzla (University Clinical Center Tuzla) is the largest public hospital complex in northeast Bosnia with a 24/7 trauma and emergency department.',
        clinicDesc: 'High-standard private clinics and dental offices operate across Tuzla. Hotel concierges and hosts can recommend trusted English-speaking doctors or dentists.',
        vaccines: 'No mandatory vaccinations are required for tourist travel to B&H.',
        emergencyContactsTitle: 'Emergency Phone Numbers (Tap to call)',
        emergencyList: [
          { name: 'Ambulance (Hitna pomoć)', number: '124', icon: '🚑', color: 'text-red-600 bg-red-50 border-red-200' },
          { name: 'Police (Policija)', number: '122', icon: '👮', color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { name: 'Fire Brigade (Vatrogasci)', number: '123', icon: '🚒', color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { name: 'Roadside Assistance (BIHAMK)', number: '1282', icon: '🚗', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        ],
      },
      simMoney: {
        title: 'Practical Essentials: SIM, Wi-Fi & Money',
        badge: 'Daily Logistics',
        simTitle: '📱 Mobile Data & Tourist SIM',
        simWarning: 'EU Roaming Warning: Bosnia is NOT in the EU "Roam Like at Home" zone! Data roaming can be extremely expensive on European SIM cards. Turn off mobile data roaming before arrival.',
        simOptions: 'Tourist SIM packages: Pick up a prepaid tourist SIM from BH Telecom ("Ultra Tourist"), m:tel ("Frend"), or HT Eronet. Available at airport kiosks, newspaper kiosks (iNovine / Tobacco shops), gas stations, or telecom centers. Typically ~15–20 BAM (€7–10) for 15–30 GB of 4G data valid 7–10 days. Alternatively, install an eSIM (Airalo, Holafly) before departure.',
        wifiTitle: '📶 Free Wi-Fi in Tuzla',
        wifiDesc: 'Free and fast Wi-Fi is widely available in almost all cafes, restaurants, hotels, and shopping malls (Bingo City Center, RK Tuzlanka, and Central City Square Trg Slobode).',
        moneyTitle: '💶 Currency, Cash & ATMs',
        peggedRate: 'Local Currency: Bosnian Convertible Mark (BAM / KM), pegged to the Euro at a fixed rate: 1 EUR = 1.95583 KM (roughly 1 KM ≈ €0.51).',
        cashAdvice: 'Cash is Essential: While cards (Visa/Mastercard) are accepted in supermarkets, shopping malls, and large restaurants, smaller cafes, bakeries, street markets, local taxis, and bus lines 34 & 11 require CASH ONLY in KM (fares 2.50–5.50 KM).',
        atmAdvice: 'ATMs (Bankomati): Widely accessible throughout the city center (Raiffeisen, UniCredit, Intesa Sanpaolo, NLB). When withdrawing from foreign cards, always decline dynamic currency conversion ("Without Conversion") for the best bank rate.',
      },
    },
    bs: {
      title: 'Praktični turistički vodič i Aerodrom Tuzla',
      subtitle: 'Ključne informacije za letove, aerodromski prevoz, granične procedure, carinu, zdravstvo i plaćanje u Tuzli.',
      warningBanner: 'Pravila ulaska mogu se promijeniti u kratkom roku — provjerite sa svojom ambasadom ili Ministarstvom vanjskih poslova BiH 2–4 sedmice prije polaska.',
      showWarning: 'Prikaži službeno upozorenje za ulazak',
      filters: {
        all: 'Sve praktične info',
        flights: '✈️ Letovi i Aerodrom TZL',
        bus: '🚌 Autobuske linije (34 i 11)',
        entry: '🛂 Ulazak i Carina',
        health: '🏥 Zdravstvo i Osiguranje',
        simMoney: '💡 SIM, Wi-Fi i Novac',
      },
      quickItineraryNotice: 'Želite organizovan 3-dnevni plan posjete gradu? Pogledajte naš preporučeni itinerar.',
      openItineraryBtn: 'Otvori 3-Dnevni plan',
      flights: {
        title: 'Međunarodni aerodrom Tuzla (TZL) i letovi',
        badge: 'Ciljni aerodrom: TZL',
        description: 'Međunarodni aerodrom Tuzla (TZL) u Dubravama je glavna vazdušna luka sjeveroistočne Bosne i Hercegovine, a letove gotovo isključivo obavlja Wizz Air.',
        germanyHeading: '🇩🇪 Direktni letovi iz Njemačke (Wizz Air)',
        germanyDesc: 'Wizz Air nudi direktne sezonske letove do TZL-a iz 4 njemačka grada, oko 2–4 puta sedmično po liniji, uz vrijeme leta ≈ 1h 40m:',
        germanyAirports: [
          { code: 'BER', city: 'Berlin Brandenburg', freq: '~2–3 sedmično', time: '≈ 1h 40m' },
          { code: 'DTM', city: 'Dortmund', freq: '~2–4 sedmično', time: '≈ 1h 45m' },
          { code: 'HAM', city: 'Hamburg', freq: '~2–3 sedmično', time: '≈ 1h 50m' },
          { code: 'FMM', city: 'Memmingen / Minhen Zapad', freq: '~2–4 sedmično', time: '≈ 1h 25m' },
        ],
        otherCountriesHeading: '🇪🇺 Letovi iz drugih evropskih zemalja',
        otherCountriesDesc: 'Wizz Air također povezuje Tuzlu sa destinacijama širom Evrope:',
        otherCountriesList: [
          { country: '🇸🇪 Švedska', routes: 'Stockholm (NYO), Malmö (MMX), Göteborg (GOT)' },
          { country: '🇦🇹 Austrija', routes: 'Beč (VIE)' },
          { country: '🇨🇭 Švicarska', routes: 'Basel-Mulhouse-Freiburg (BSL)' },
          { country: '🇸🇰 Slovačka', routes: 'Bratislava (BTS)' },
        ],
        timetableAdvisory: 'Sezonski red letenja se mijenja između ljeta i zime. Obavezno provjerite tačne datume na zvaničnom Wizz Air redu letenja.',
        wizzAirLink: 'Wizz Air Red Letenja',
      },
      bus: {
        title: 'Aerodromski i lokalni prevoz: Linije 34 i 11',
        badge: 'Autobuski prevoz • Linije 34 i 11',
        priceNotice: 'Cijena karte: U zavisnosti od udaljenosti / relacije cijena karte iznosi od 2.50 KM do 5.50 KM.',
        stats: [
          { label: 'Vrijeme vožnje', value: '~35–55 min' },
          { label: 'Cijena karte', value: '2.50 – 5.50 KM' },
          { label: 'Način plaćanja', value: 'Samo gotovina (KM)' },
          { label: 'Aerodrom direktno', value: 'Linija 34 (Direktna)' },
        ],
        cashWarning: 'Važno: Vozači autobusa primaju ISKLJUČIVO GOTOVINU u KM. Cijena karte iznosi od 2.50 KM do 5.50 KM u zavisnosti od relacije. Pripremite sitan novac jer kartice i valute poput eura ne primaju.',
        taxiAlternative: 'Taksi alternativa: Zvanična taksi vozila čekaju ispred dolaznog terminala. Vožnja do centra traje ~20–25 minuta i košta oko 30–40 KM (€15–20). Dogovorite cijenu ili provjerite taksimetar prije polaska.',
        line34: {
          title: 'Linija 34: Tuzla (AS Istok) – B. Malta – Aerodrom Tuzla (Dubrave)',
          badge: 'Direktno do aerodroma',
          desc: 'Ova linija saobraća direktno do Aerodroma Tuzla u Dubravama (staje na samom aerodromu).',
          days: 'Radni dani, subota i nedjelja (polasci):',
          toAirportLabel: 'Polasci iz Tuzle (AS Istok) prema Aerodromu:',
          toAirportTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'],
          fromAirportLabel: 'Polasci sa Aerodroma prema Tuzli (AS Istok):',
          fromAirportTimes: ['06:00', '08:00', '10:00 (radnim danima i 10:00)', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        },
        line11: {
          title: 'Linija 11: Tuzla (AS Istok) – Donje Dubrave – Kalesija (AS)',
          badge: 'Preko Dubrava (~800 m do aerodroma)',
          desc: 'Ova linija prolazi kroz Dubrave (stanica Donje Dubrave) na relaciji između Autobuske stanice Istok u Tuzli i Kalesije.',
          walkDesc: 'Pješke ~800 m (~10 min) od putničkog terminala aerodroma TZL do stanice na glavnoj cesti u Dubravama.',
          days: 'Radni dani (tokom školske godine):',
          toKalesijaLabel: 'Polasci iz Tuzle (AS Istok) prema Kalesiji preko Dubrava:',
          toKalesijaTimes: ['05:55', '07:15', '08:15', '10:15', '11:55', '13:15', '14:45', '15:35', '16:10', '17:20', '18:05', '18:55'],
          toTuzlaLabel: 'Polasci iz Kalesije prema Tuzli preko Dubrava:',
          toTuzlaTimes: ['05:30', '06:30', '07:15', '07:45', '08:55', '10:30', '11:40', '12:40', '13:30', '15:05', '16:50', '18:55'],
        },
      },
      entry: {
        title: 'Uslovi ulaska i granične procedure (EU i Non-EU)',
        badge: 'Granična i carinska pravila',
        borderProcedures: 'Pasoška i granična kontrola',
        borderProceduresItems: [
          'Pečat u pasošu: Pasoš se pečatira pri ulasku i izlasku. To je standardna procedura koja evidentira datum ulaska radi praćenja boravka do 90 dana u periodu od 180 dana.',
          'Nema papirnih kartona: Na većini prelaza i aerodroma ne popunjavaju se papirni ulazno-izlazni obrasci.',
        ],
        registrationTitle: 'Obavezna prijava boravka u roku od 24 sata',
        hotelReg: 'Hoteli i pansioni: Prilikom prijave u hotel s pasošem, osoblje vas automatski prijavljuje nadležnim službama.',
        privateReg: 'Privatni smještaj i posjete: Ako boravite kod prijatelja ili u privatnom smještaju, domaćin ili vi lično morate prijaviti boravak u lokalnoj policijskoj stanici ili Terenskom centru Službe za poslove sa strancima u roku od 24 sata.',
        customsTitle: 'Carinska unija i deklaracija novca',
        customsDesc: 'BiH NIJE članica Carinske unije EU. Lični prtljag, laptopi, kamere i oprema za konferencije unose se bez carine.',
        cashRule: 'Deklaracija gotovine: Iznose gotovog novca ili vrijednosnih papira veće od 10.000 KM (oko 5.000 €) morate prijaviti carini na ulazu ili izlazu.',
        specialCasesTitle: 'Posebna pravila za državljane',
        ukRule: '🇬🇧 Državljani UK: Bez vize do 90 dana. Obavezan je važeći pasoš (lična karta UK se ne prihvata).',
        balkansRule: '🇧🇦 / 🇷🇸 / 🇲🇪 / 🇲🇰 / 🇦🇱 Zapadni Balkan: Državljani Srbije, Crne Gore, Sjeverne Makedonije i Albanije ulaze bez vize, najčešće uz važeću biometrijsku ličnu kartu.',
        kosovoRule: '🇽🇰 Kosovo pečati: BiH zvanično ne priznaje Kosovo i ima poseban vizni režim za pasoše Kosova. Međutim, raniji pečati Kosova u stranim ili EU pasošima historijski ne prave problem pri ulasku u BiH.',
      },
      health: {
        title: 'Zdravstvo, osiguranje i hitne službe',
        badge: 'Medicinske informacije',
        ehicNotice: '⚠️ EHIC kartica NE VAŽI u Bosni i Hercegovini',
        ehicDesc: 'Evropska kartica zdravstvenog osiguranja (EHIC) ne važi u BiH. Ne postoji recipročno besplatno državno liječenje za strane turiste.',
        insuranceRecommendation: 'Strogo se preporučuje privatno putno zdravstveno osiguranje sa pokrićem medicinskih troškova prije polaska na put.',
        hospitalTitle: 'Bolnice i medicinske ustanove',
        hospitalDesc: 'UKC Tuzla (Univerzitetski klinički centar) je najveća bolnica u regiji sa dežurnim urgentnim centrom otvorenim 24/7.',
        clinicDesc: 'U Tuzli postoji veliki broj vrhunskih privatnih ordinacija i stomatoloških centara sa osobljem koje govori engleski jezik.',
        vaccines: 'Za turistički ulazak u BiH nisu potrebne posebne vakcinacije.',
        emergencyContactsTitle: 'Brojevi hitnih službi (Klik za poziv)',
        emergencyList: [
          { name: 'Hitna pomoć', number: '124', icon: '🚑', color: 'text-red-600 bg-red-50 border-red-200' },
          { name: 'Policija', number: '122', icon: '👮', color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { name: 'Vatrogasci', number: '123', icon: '🚒', color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { name: 'Pomoć na cesti (BIHAMK)', number: '1282', icon: '🚗', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        ],
      },
      simMoney: {
        title: 'Praktične sitnice: SIM, Wi-Fi i novac',
        badge: 'Dnevna logistika',
        simTitle: '📱 Mobilni internet i turistički SIM',
        simWarning: 'Upozorenje za roaming: BiH nije dio EU "Roam Like at Home" regulative! Korištenje EU mobilnih podataka može stvoriti visoke troškove. Isključite prenos podataka u roamingu.',
        simOptions: 'Turistički SIM paketi: Kupite prepaid SIM karticu od BH Telecoma ("Ultra Tourist"), m:tela ("Frend") ili HT Eroneta. Dostupni na kioscima (iNovine / Tobacco), benzinskim pumpama ili poslovnicama. Cijena je oko 15–20 KM (€7–10) za 15–30 GB 4G interneta (7–10 dana). Moguće je koristiti i eSIM (Airalo, Holafly).',
        wifiTitle: '📶 Besplatan Wi-Fi u Tuzli',
        wifiDesc: 'Besplatan i brz Wi-Fi je standard u gotovo svim kafićima, restoranima, hotelima i tržnim centrima (BCC, RK Tuzlanka, Trg Slobode).',
        moneyTitle: '💶 Valuta, gotovina i bankomati',
        peggedRate: 'Lokalna valuta: Bosanska konvertibilna marka (BAM / KM), fiksno vezana za euro: 1 EUR = 1.95583 KM (oko 1 KM ≈ €0.51).',
        cashAdvice: 'Gotovina je neophodna: Iako se kartice (Visa/Mastercard) prihvataju u supermarketima, tržnim centrima i većim restoranima, manji kafići, pekare, pijace, lokalni taksisti i autobuske linije 34 i 11 zahtijevaju ISKLJUČIVO GOTOVINU u KM (cijene 2.50–5.50 KM).',
        atmAdvice: 'Bankomati: Široko dostupni u gradu (Raiffeisen, UniCredit, Intesa Sanpaolo, NLB). Prilikom podizanja novca sa inostranih kartica odaberite isplatu bez konverzije ("Without Conversion") radi najpovoljnijeg bankarskog kursa.',
      },
    },
    de: {
      title: 'Praktischer Reiseführer & Flughafen Tuzla',
      subtitle: 'Wichtige Informationen zu Flügen, Flughafentransfer, Einreisebestimmungen, Zoll, Gesundheit und Zahlungen in Tuzla.',
      warningBanner: 'Einreisebestimmungen können sich kurzfristig ändern – bitte 2–4 Wochen vor Reiseantritt bei Ihrer Botschaft oder dem Außenministerium von Bosnien und Herzegowina überprüfen.',
      showWarning: 'Offizielle Einreisehinweise anzeigen',
      filters: {
        all: 'Alle Infos',
        flights: '✈️ Flüge & TZL',
        bus: '🚌 Buslinien (34 & 11)',
        entry: '🛂 Einreise & Zoll',
        health: '🏥 Gesundheit & Versicherung',
        simMoney: '💡 SIM, WLAN & Geld',
      },
      quickItineraryNotice: 'Suchen Sie einen strukturierten Zeitplan? Nutzen Sie unseren kuratierten 3-Tage-Plan für Tuzla.',
      openItineraryBtn: '3-Tage-Plan öffnen',
      flights: {
        title: 'Internationaler Flughafen Tuzla (TZL) & Flugverbindungen',
        badge: 'Zielflughafen: TZL',
        description: 'Der Internationale Flughafen Tuzla (TZL) in Dubrave ist das Tor nach Nordost-Bosnien und wird fast ausschließlich von der Fluggesellschaft Wizz Air angeflogen.',
        germanyHeading: '🇩🇪 Direktflüge aus Deutschland (Wizz Air)',
        germanyDesc: 'Direkte saisonale Non-Stop-Flüge nach TZL gibt es von 4 deutschen Flughäfen, ca. 2–4 Mal wöchentlich, Flugdauer ≈ 1h 40m:',
        germanyAirports: [
          { code: 'BER', city: 'Berlin Brandenburg', freq: '~2–3x wöchentlich', time: '≈ 1h 40m' },
          { code: 'DTM', city: 'Dortmund', freq: '~2–4x wöchentlich', time: '≈ 1h 45m' },
          { code: 'HAM', city: 'Hamburg', freq: '~2–3x wöchentlich', time: '≈ 1h 50m' },
          { code: 'FMM', city: 'Memmingen / München-West', freq: '~2–4x wöchentlich', time: '≈ 1h 25m' },
        ],
        otherCountriesHeading: '🇪🇺 Flüge aus weiteren Ländern',
        otherCountriesDesc: 'Wizz Air bedient Tuzla zudem aus folgenden Regionen:',
        otherCountriesList: [
          { country: '🇸🇪 Schweden', routes: 'Stockholm (NYO), Malmö (MMX), Göteborg (GOT)' },
          { country: '🇦🇹 Österreich', routes: 'Wien (VIE)' },
          { country: '🇨🇭 Schweiz', routes: 'Basel-Mulhouse-Freiburg (BSL)' },
          { country: '🇸🇰 Slowakei', routes: 'Bratislava (BTS)' },
        ],
        timetableAdvisory: 'Saisonflugpläne variieren zwischen Sommer und Winter. Bitte prüfen Sie die aktuellen Reisetage stets auf dem Wizz Air Flugplan.',
        wizzAirLink: 'Wizz Air Flugplan aufrufen',
      },
      bus: {
        title: 'Flughafentransfer & Regionalbusse: Linien 34 & 11',
        badge: 'Buslinien • 34 (Direkt) & 11',
        priceNotice: 'Fahrpreis: Je nach Entfernung beträgt der Fahrpreis zwischen 2.50 KM und 5.50 KM.',
        stats: [
          { label: 'Fahrzeit', value: '~35–55 Min.' },
          { label: 'Fahrpreis', value: '2.50 – 5.50 KM' },
          { label: 'Zahlung', value: 'Nur Bargeld in KM' },
          { label: 'Flughafen Direkt', value: 'Linie 34 (Direkt)' },
        ],
        cashWarning: 'Sehr wichtig: Der Fahrer akzeptiert NUR BARGELD in KM (BAM). Der Fahrpreis liegt je nach Strecke zwischen 2.50 KM und 5.50 KM. Bitte halten Sie Bargeld passend bereit.',
        taxiAlternative: 'Taxi-Alternative: Taxis stehen direkt am Ankunftsbereich. Eine Fahrt ins Stadtzentrum dauert 20–25 Minuten und kostet etwa 30–40 BAM (15–20 €). Vereinbaren Sie den Preis vorab oder achten Sie auf das Taxameter.',
        line34: {
          title: 'Linie 34: Tuzla (AS Istok) – B. Malta – Flughafen Tuzla (Dubrave)',
          badge: 'Direktverbindung zum Flughafen',
          desc: 'Diese Linie fährt direkt zum Flughafen Tuzla in Dubrave (Haltestelle direkt am Terminal).',
          days: 'Werktage, Samstag und Sonntag (Tägliche Abfahrten):',
          toAirportLabel: 'Abfahrten ab Tuzla (AS Istok) zum Flughafen:',
          toAirportTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'],
          fromAirportLabel: 'Abfahrten ab Flughafen nach Tuzla (AS Istok):',
          fromAirportTimes: ['06:00', '08:00', '10:00 (werktags auch 10:00)', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        },
        line11: {
          title: 'Linie 11: Tuzla (AS Istok) – Donje Dubrave – Kalesija (AS)',
          badge: 'Über Dubrave (~800 m zum Terminal)',
          desc: 'Fährt zwischen dem Ost-Busbahnhof Tuzla und Kalesija mit Halt in Dubrave (Station Donje Dubrave).',
          walkDesc: 'Ca. 800 m (ca. 10 Min.) Fußweg vom Terminal zur Haltestelle an der Hauptstraße in Dubrave.',
          days: 'Werktage (während des Schuljahres):',
          toKalesijaLabel: 'Abfahrten ab Tuzla (AS Istok) nach Kalesija über Dubrave:',
          toKalesijaTimes: ['05:55', '07:15', '08:15', '10:15', '11:55', '13:15', '14:45', '15:35', '16:10', '17:20', '18:05', '18:55'],
          toTuzlaLabel: 'Abfahrten ab Kalesija nach Tuzla über Dubrave:',
          toTuzlaTimes: ['05:30', '06:30', '07:15', '07:45', '08:55', '10:30', '11:40', '12:40', '13:30', '15:05', '16:50', '18:55'],
        },
      },
      entry: {
        title: 'Einreisebestimmungen & Grenzformalitäten (EU & Nicht-EU)',
        badge: 'Grenz- und Zollregeln',
        borderProcedures: 'Pass- und Grenzkontrollen',
        borderProceduresItems: [
          'Stempel im Reisepass: Pässe werden bei Ein- und Ausreise gestempelt. Dies dient als Nachweis der erlaubten Aufenthaltsdauer (90 Tage im 180-Tage-Fenster).',
          'Keine Papierformulare: An den meisten Grenzübergängen und am Flughafen müssen keine Papier-Einreiseformulare ausgefüllt werden.',
        ],
        registrationTitle: 'Meldepflicht innerhalb von 24 Stunden',
        hotelReg: 'Hotels & Pensionen: Bei Hotelaufenthalten übernimmt das Personal die polizeiliche Meldung bei Vorlage des Ausweises vollautomatisch.',
        privateReg: 'Privatunterkünfte & Airbnb: Bei Privatübernachtungen bei Freunden oder in nicht registrierten Wohnungen müssen Sie sich innerhalb von 24 Stunden bei der örtlichen Polizeistation oder Ausländerbehörde melden.',
        customsTitle: 'Zoll & Bargeldfreigrenzen',
        customsDesc: 'Bosnien und Herzegowina ist NICHT Teil der EU-Zollunion. Persönliche Gegenstände, Laptops, Kameras und Messe-/Konferenzgeräte können zollfrei eingeführt werden.',
        cashRule: 'Bargelddeklaration: Bargeld oder Wertpapiere über 10.000 KM (ca. 5.000 €) müssen bei der Ein- und Ausreise unaufgefordert deklariert werden.',
        specialCasesTitle: 'Sonderregelungen für bestimmte Staaten',
        ukRule: '🇬🇧 Bürger des Vereinigten Königreichs: Visafrei bis zu 90 Tage. Es wird ein gültiger Reisepass benötigt (UK-Personalausweis reicht nicht aus).',
        balkansRule: '🇧🇦 / 🇷🇸 / 🇲🇪 / 🇲🇰 / 🇦🇱 Westbalkan-Staaten: Bürger aus Serbien, Montenegro, Nordmazedonien und Albanien reisen visafrei mit biometrischem Personalausweis ein.',
        kosovoRule: '🇽🇰 Kosovo-Stempel: Bosnien und Herzegowina erkennt das Kosovo nicht offiziell an. Frühere Stempel des Kosovo in ausländischen oder EU-Pässen führen jedoch in der Praxis zu keinen Einreiseverweigerungen.',
      },
      health: {
        title: 'Gesundheit, Versicherung & Notrufe',
        badge: 'Medizinische Hinweise',
        ehicNotice: '⚠️ Die europäische Krankenversicherungskarte (EHIC) gilt NICHT in Bosnien',
        ehicDesc: 'In Bosnien und Herzegowina greift die europäische EHIC-Krankenkarte nicht. Es besteht kein gegenseitiger kostenloser staatlicher Versicherungsschutz.',
        insuranceRecommendation: 'Eine private Auslandskrankenversicherung mit Rückholschutz wird vor Abreise dringend empfohlen.',
        hospitalTitle: 'Krankenhäuser & Kliniken',
        hospitalDesc: 'Das Universitätsklinikum Tuzla (UKC Tuzla) ist die führende Großklinik der Region mit einer 24/7 Notfall- und Traumastation.',
        clinicDesc: 'In Tuzla gibt es erstklassige private Praxen und renommierte Zahnkliniken, oft mit englischsprachigen Ärzten.',
        vaccines: 'Für Urlauber bestehen keine vorgeschriebenen Pflichtimpfungen.',
        emergencyContactsTitle: 'Notrufnummern (Antippen zum Anrufen)',
        emergencyList: [
          { name: 'Rettungsdienst (Hitna pomoć)', number: '124', icon: '🚑', color: 'text-red-600 bg-red-50 border-red-200' },
          { name: 'Polizei (Policija)', number: '122', icon: '👮', color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { name: 'Feuerwehr (Vatrogasci)', number: '123', icon: '🚒', color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { name: 'Pannenhilfe (BIHAMK)', number: '1282', icon: '🚗', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        ],
      },
      simMoney: {
        title: 'Praktisches: SIM-Karten, WLAN & Währung',
        badge: 'Alltagslogistik',
        simTitle: '📱 Mobiles Internet & Touristen-SIM',
        simWarning: 'EU-Roaming-Warnung: Bosnien gehört NICHT zur EU-Roamingzone („Roam Like at Home“)! Datenroaming kann sehr teuer werden. Schalten Sie das Daten-Roaming vor der Landung aus.',
        simOptions: 'Lokale Prepaid-Karten: Erhältlich von BH Telecom („Ultra Tourist“), m:tel („Frend“) oder HT Eronet an Kiosken (iNovine / Tabakläden), Tankstellen oder Filialen. Ca. 15–20 KM (7–10 €) für 15–30 GB Daten (7–10 Tage). Alternativ eSIM (Airalo, Holafly) vorab buchen.',
        wifiTitle: '📶 Kostenloses WLAN in Tuzla',
        wifiDesc: 'Freies WLAN steht in fast allen Cafés, Restaurants, Hotels und Shoppingmalls (Bingo City Center, RK Tuzlanka, Freiheitsplatz) gratis zur Verfügung.',
        moneyTitle: '💶 Währung, Bargeld & Geldautomaten',
        peggedRate: 'Währung: Konvertible Mark (BAM / KM), fester Wechselkurs zum Euro: 1 EUR = 1,95583 KM (1 KM ≈ 0,51 €).',
        cashAdvice: 'Bargeld ist unverzichtbar: Während Supermärkte und Malls Karten akzeptieren, gilt für Bäcker, Taxis, Kioske, Cafés und die Buslinien 34 und 11 reine BARGELDPFLICHT in KM (Fahrpreis 2.50–5.50 KM).',
        atmAdvice: 'Geldautomaten (Bankomati): An vielen Ecken vorhanden (UniCredit, Raiffeisen, Intesa Sanpaolo). Bei Abhebungen immer „Abrechnung ohne Konvertierung“ wählen, um den offiziellen Bankkurs zu erhalten.',
      },
    },
    tr: {
      title: 'Pratik Seyahat Rehberi ve Tuzla Havalimanı',
      subtitle: 'Tuzla için uçuşlar, havalimanı ulaşımı, sınır ve gümrük kuralları, sağlık sigortası ve günlük pratik bilgiler.',
      warningBanner: 'Giriş kuralları kısa sürede değişebilir — kalkıştan 2–4 hafta önce büyükelçiliğiniz veya BH Dışişleri Bakanlığı ile doğrulayın.',
      showWarning: 'Giriş uyarısını göster',
      filters: {
        all: 'Tüm Bilgiler',
        flights: '✈️ Uçuşlar & TZL',
        bus: '🚌 Otobüs Hatları (34 ve 11)',
        entry: '🛂 Giriş & Gümrük',
        health: '🏥 Sağlık & Sigorta',
        simMoney: '💡 SIM, Wi-Fi & Para',
      },
      quickItineraryNotice: 'Detaylı bir gezi programı mı arıyorsunuz? Özel olarak hazırlanan 3 Günlük Tuzla Planımızı inceleyin.',
      openItineraryBtn: '3 Günlük Planı Aç',
      flights: {
        title: 'Tuzla Uluslararası Havalimanı (TZL) ve Uçuşlar',
        badge: 'Hedef Havalimanı: TZL',
        description: 'Tuzla Uluslararası Havalimanı (TZL), Bosna-Hersek’in kuzeydoğusundaki ana kapıdır ve ağırlıklı olarak Wizz Air tarafından hizmet verilmektedir.',
        germanyHeading: '🇩🇪 Almanya’dan Direkt Uçuşlar (Wizz Air)',
        germanyDesc: 'Wizz Air, Almanya’dan Tuzla Havalimanı’na haftada ~2–4 kez direkt sefer düzenlemektedir. Uçuş süresi yaklaşık 1s 40dk:',
        germanyAirports: [
          { code: 'BER', city: 'Berlin Brandenburg', freq: 'Haftada ~2–3', time: '≈ 1s 40dk' },
          { code: 'DTM', city: 'Dortmund', freq: 'Haftada ~2–4', time: '≈ 1s 45dk' },
          { code: 'HAM', city: 'Hamburg', freq: 'Haftada ~2–3', time: '≈ 1s 50dk' },
          { code: 'FMM', city: 'Memmingen / Münih Batı', freq: 'Haftada ~2–4', time: '≈ 1s 25dk' },
        ],
        otherCountriesHeading: '🇪🇺 Diğer Ülkelerden Direkt Seferler',
        otherCountriesDesc: 'Wizz Air ayrıca şu ülkelerden Tuzla’ya direkt uçuşlar sağlamaktadır:',
        otherCountriesList: [
          { country: '🇸🇪 İsveç', routes: 'Stockholm (NYO), Malmö (MMX), Göteborg (GOT)' },
          { country: '🇦🇹 Avusturya', routes: 'Viyana (VIE)' },
          { country: '🇨🇭 İsviçre', routes: 'Basel-Mulhouse (BSL)' },
          { country: '🇸🇰 Slovakya', routes: 'Bratislava (BTS)' },
        ],
        timetableAdvisory: 'Sezonluk uçuş takvimleri değişiklik gösterebilir. Güncel uçuş tarihlerini wizzair.com/timetable adresinden teyit ediniz.',
        wizzAirLink: 'Wizz Air Uçuş Tarifesi',
      },
      bus: {
        title: 'Havalimanı ve Şehirlerarası Otobüs Hatları (Hat 34 ve 11)',
        badge: 'Otobüs Ulaşımı • Hat 34 & 11',
        priceNotice: 'Bilet Ücreti: Mesafeye bağlı olarak 2.50 KM ile 5.50 KM arasında değişmektedir.',
        stats: [
          { label: 'Yolculuk Süresi', value: '~35–55 dk' },
          { label: 'Bilet Ücreti', value: '2.50 – 5.50 KM' },
          { label: 'Ödeme', value: 'Yalnızca nakit (KM)' },
          { label: 'Havalimanı Direkt', value: 'Hat 34 (Direkt)' },
        ],
        cashWarning: 'Önemli: Otobüs şoförü YALNIZCA NAKİT KM kabul eder. Mesafeye göre bilet ücreti 2.50 KM ile 5.50 KM arasındadır. Kart veya Euro geçmediğinden yanınızda tam bozuk KM bulundurun.',
        taxiAlternative: 'Taksi Seçeneği: Gelen yolcu çıkışında resmi taksiler beklemektedir. Tuzla merkezine yolculuk 20–25 dakika sürer ve yaklaşık 30–40 BAM (15–20 €) tutar.',
        line34: {
          title: 'Hat 34: Tuzla (AS Istok) – B. Malta – Tuzla Havalimanı (Dubrave)',
          badge: 'Havalimanına Direkt',
          desc: 'Bu hat doğrudan Dubrave’deki Tuzla Uluslararası Havalimanı’na sefer yapmaktadır (terminalde durur).',
          days: 'Hafta içi, Cumartesi ve Pazar (Günlük kalkışlar):',
          toAirportLabel: 'Tuzla’dan (AS Istok) Havalimanı’na kalkışlar:',
          toAirportTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'],
          fromAirportLabel: 'Havalimanı’ndan Tuzla’ya (AS Istok) kalkışlar:',
          fromAirportTimes: ['06:00', '08:00', '10:00 (hafta içi ayrıca 10:00)', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        },
        line11: {
          title: 'Hat 11: Tuzla (AS Istok) – Donje Dubrave – Kalesija (AS)',
          badge: 'Dubrave Üzerinden (~800 m)',
          desc: 'Bu hat Tuzla Doğu Otogarı ile Kalesija arasında Dubrave (Donje Dubrave durağı) üzerinden geçer.',
          walkDesc: 'Havalimanı terminalinden Dubrave anayol durağına yaklaşık 800 m (~10 dk) yürüyüş.',
          days: 'Hafta içi günleri (Okul dönemi boyunca):',
          toKalesijaLabel: 'Tuzla’dan (AS Istok) Dubrave üzerinden Kalesija’ya kalkışlar:',
          toKalesijaTimes: ['05:55', '07:15', '08:15', '10:15', '11:55', '13:15', '14:45', '15:35', '16:10', '17:20', '18:05', '18:55'],
          toTuzlaLabel: 'Kalesija’dan Dubrave üzerinden Tuzla’ya kalkışlar:',
          toTuzlaTimes: ['05:30', '06:30', '07:15', '07:45', '08:55', '10:30', '11:40', '12:40', '13:30', '15:05', '16:50', '18:55'],
        },
      },
      entry: {
        title: 'Giriş Koşulları ve Sınır İşlemleri (AB ve AB Dışı)',
        badge: 'Sınır ve Gümrük Kuralları',
        borderProcedures: 'Pasaport ve Sınır Kontrolü',
        borderProceduresItems: [
          'Pasaport kaşesi: Girişte ve çıkışta pasaportunuza kaşe vurulur (90 günlük vizesiz kalış süresini hesaplamak için standarttır).',
          'Kağıt kart yok: Çoğu sınır kapısında kağıt giriş/çıkış formu doldurulması gerekmez.',
        ],
        registrationTitle: '24 Saat İçinde Konaklama Kaydı Zorunluluğu',
        hotelReg: 'Otel ve Pansiyonlar: Oteller pasaportunuzla giriş yapıldığında emniyet kaydını otomatik olarak tamamlar.',
        privateReg: 'Özel Konaklama & Airbnb: Ev kiralama veya tanıdıkta kalma durumunda, ev sahibiyle birlikte 24 saat içinde yerel polis merkezine kayıt yaptırılmalıdır.',
        customsTitle: 'Gümrük Birliği ve Nakit Bildirimi',
        customsDesc: 'Bosna-Hersek AB Gümrük Birliği üyesi DEĞİLDİR. Kişisel eşyalar, dizüstü bilgisayarlar ve seyahat ekipmanları gümrüksüz geçirilebilir.',
        cashRule: 'Nakit Bildirimi: 10.000 KM (yaklaşık 5.000 €) üzerindeki nakit paranın girişte/çıkışta gümrük memurlarına beyan edilmesi zorunludur.',
        specialCasesTitle: 'Özel Ülke Statüleri',
        ukRule: '🇬🇧 İngiltere Vatandaşları: 90 güne kadar vizesiz. Geçerli bir pasaport zorunludur (UK kimlik kartı geçerli değildir).',
        balkansRule: '🇧🇦 / 🇷🇸 / 🇲🇪 / 🇲🇰 / 🇦🇱 Batı Balkanlar: Sırbistan, Karadağ, Kuzey Makedonya ve Arnavutluk vatandaşları biyometrik kimlikle vizesiz giriş yapabilir.',
        kosovoRule: '🇽🇰 Kosovo Damgası: Bosna-Hersek Kosova’yı resmen tanımamaktadır. Ancak yabancı pasaportlardaki Kosova damgaları ülkeye girişte herhangi bir engel oluşturmaz.',
      },
      health: {
        title: 'Sağlık, Sigorta ve Acil Durumlar',
        badge: 'Sağlık Bilgileri',
        ehicNotice: '⚠️ EHIC (Avrupa Sağlık Kartı) Bosna’da GEÇERLİ DEĞİLDİR',
        ehicDesc: 'Avrupa Sağlık Sigortası Kartı (EHIC) Bosna-Hersek’te geçerli değildir. Yabancılar için ücretsiz devlet sağlık hizmeti bulunmamaktadır.',
        insuranceRecommendation: 'Seyahat öncesinde kapsamlı uluslararası seyahat sağlık sigortası yaptırılması önemle tavsiye edilir.',
        hospitalTitle: 'Hastaneler ve Klinikler',
        hospitalDesc: 'UKC Tuzla (Üniversite Klinik Merkezi), bölgenin 7/24 acil servis hizmeti veren en büyük tam teşekküllü devlet hastanesidir.',
        clinicDesc: 'Tuzla’da İngilizce konuşan hekimlerin bulunduğu modern özel klinikler ve diş sağlığı merkezleri mevcuttur.',
        vaccines: 'Turistik seyahatler için zorunlu bir aşı şartı bulunmamaktadır.',
        emergencyContactsTitle: 'Acil Durum Numaraları (Aramak için dokunun)',
        emergencyList: [
          { name: 'Ambulans (Hitna pomoć)', number: '124', icon: '🚑', color: 'text-red-600 bg-red-50 border-red-200' },
          { name: 'Polis (Policija)', number: '122', icon: '👮', color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { name: 'İtfaiye (Vatrogasci)', number: '123', icon: '🚒', color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { name: 'Yol Yardımı (BIHAMK)', number: '1282', icon: '🚗', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        ],
      },
      simMoney: {
        title: 'Pratik Bilgiler: SIM, Wi-Fi ve Para',
        badge: 'Günlük Lojistik',
        simTitle: '📱 Mobil Veri ve Turist SIM Kartı',
        simWarning: 'Dolaşım Uyarısı: Bosna-Hersek AB içi ücretsiz dolaşım bölgesinde DEĞİLDİR! Yüksek faturalarla karşılaşmamak için veri dolaşımını kapatın.',
        simOptions: 'Turist SIM Seçenekleri: Havalimanı büfelerinden veya şehirdeki gazete bayilerinden (iNovine) BH Telecom, m:tel veya HT Eronet turist SIM kartı alabilirsiniz. 15–20 KM (7–10 €) karşılığında 15–30 GB internet verilir. Alternatif olarak eSIM kullanabilirsiniz.',
        wifiTitle: '📶 Ücretsiz Wi-Fi',
        wifiDesc: 'Kafeler, oteller, restoranlar ve alışveriş merkezlerinde (BCC, Özgürlük Meydanı) ücretsiz Wi-Fi yaygındır.',
        moneyTitle: '💶 Para Birimi, Nakit ve ATM',
        peggedRate: 'Para Birimi: Bosna Konvertibl Markı (BAM / KM). Euro’ya sabit kurludur: 1 EUR = 1.95583 KM.',
        cashAdvice: 'Nakit Taşımak Şarttır: Süpermarketlerde kart geçse de fırınlar, küçük kafeler, taksiler ve 34 ile 11 nolu otobüs hatları YALNIZCA NAKİT KM kabul eder (ücret 2.50–5.50 KM).',
        atmAdvice: 'ATM’ler: Şehir merkezinde çok sayıda bankamatik vardır. Çekerken dönüştürmesiz ("Without Conversion") seçeneğini tercih ediniz.',
      },
    },
  };

  // Safe accessor with fallback to English if missing
  const t = content[lang] ?? content.en;

  return (
    <div className="w-full space-y-6">
      {/* Prominent Dismissible Warning Banner */}
      {!isWarningDismissed ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 pr-6">
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                {lang === 'bs' ? 'Službeno upozorenje za putnike' : lang === 'de' ? 'Offizieller Reisehinweis' : lang === 'tr' ? 'Resmi Seyahat Uyarısı' : 'Official Travel Advisory'}
              </div>
              <p className="mt-1 text-sm sm:text-base font-bold leading-snug text-amber-950">
                {t.warningBanner}
              </p>
            </div>
            <button
              onClick={() => setIsWarningDismissed(true)}
              className="absolute right-3 top-3 rounded-full p-2 text-amber-700 transition-colors hover:bg-amber-200/60"
              aria-label="Dismiss warning"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setIsWarningDismissed(false)}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            {t.showWarning}
          </button>
        </div>
      )}

      {/* Hero Header with Quick Link to 3-Day Plan */}
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/30">
              <Compass className="h-3.5 w-3.5" />
              Tuzla Travel Handbook
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">{t.title}</h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-blue-100/80 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {onSwitchToItinerary && (
            <button
              onClick={onSwitchToItinerary}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-950 shadow-md transition-all hover:bg-blue-50 hover:scale-[1.02] active:scale-95"
            >
              <CalendarCheck className="h-4 w-4 text-blue-600" />
              {t.openItineraryBtn}
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {(['all', 'flights', 'bus', 'entry', 'health', 'simMoney'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all ${
                selectedFilter === key
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {t.filters[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Practical Sections */}
      <div className="space-y-6">
        {/* SECTION 1: Flights & TZL */}
        {(selectedFilter === 'all' || selectedFilter === 'flights') && (
          <section className="rounded-[1.75rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">{t.flights.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.flights.title}</h3>
              </div>
            </div>

            <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {t.flights.description}
            </p>

            {/* Germany Direct Routes */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                {t.flights.germanyHeading}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {t.flights.germanyDesc}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {t.flights.germanyAirports.map((item) => (
                  <div key={item.code} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-800">{item.code}</span>
                      <span className="text-xs font-semibold text-slate-500">{item.time}</span>
                    </div>
                    <div className="mt-2 text-sm font-black text-slate-900">{item.city}</div>
                    <div className="mt-1 text-xs text-blue-700 font-bold">{item.freq}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other European Countries */}
            <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
              <h4 className="text-base font-black text-slate-900">
                {t.flights.otherCountriesHeading}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {t.flights.otherCountriesDesc}
              </p>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {t.flights.otherCountriesList.map((c) => (
                  <div key={c.country} className="flex items-start gap-3 rounded-xl bg-white p-3.5 border border-slate-100 shadow-sm">
                    <div className="text-base font-black text-slate-900 min-w-[110px]">{c.country}</div>
                    <div className="text-xs font-semibold text-slate-600 leading-relaxed">{c.routes}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timetable advisory with link */}
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-cyan-700 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-semibold text-cyan-950">
                  {t.flights.timetableAdvisory}
                </p>
              </div>
              <a
                href="https://wizzair.com/en-gb/flights/timetable"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 shrink-0 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-sm hover:bg-cyan-700 transition-colors"
              >
                <span>{t.flights.wizzAirLink}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>
        )}

        {/* SECTION 2: Bus Lines 34 & 11 Transit */}
        {(selectedFilter === 'all' || selectedFilter === 'bus') && (
          <section className="rounded-[1.75rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-600">{t.bus.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.bus.title}</h3>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {t.bus.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800">{stat.label}</div>
                  <div className="mt-1 text-base sm:text-lg font-black text-slate-900">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Price Distance Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center gap-3">
              <Coins className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                {t.bus.priceNotice}
              </p>
            </div>

            {/* LINIJA 34 CARD */}
            <div className="rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm shadow-sm">
                    34
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {t.bus.line34.title}
                  </h4>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
                  {t.bus.line34.badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {t.bus.line34.desc}
              </p>

              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-100/70 rounded-xl px-3.5 py-2 border border-emerald-200">
                <CalendarCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{t.bus.line34.days}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Outbound */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 mb-2.5">
                    <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{t.bus.line34.toAirportLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.bus.line34.toAirportTimes.map((time, idx) => (
                      <span key={idx} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200 shadow-2xs">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inbound */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 mb-2.5">
                    <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{t.bus.line34.fromAirportLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.bus.line34.fromAirportTimes.map((time, idx) => (
                      <span key={idx} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200 shadow-2xs">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LINIJA 11 CARD */}
            <div className="rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm">
                    11
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {t.bus.line11.title}
                  </h4>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-800 border border-blue-200">
                  {t.bus.line11.badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {t.bus.line11.desc}
              </p>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 text-xs text-slate-600 font-medium">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{t.bus.line11.walkDesc}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100/70 rounded-xl px-3.5 py-2 border border-blue-200">
                <CalendarCheck className="h-4 w-4 text-blue-700 shrink-0" />
                <span>{t.bus.line11.days}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Outbound to Kalesija */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 mb-2.5">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{t.bus.line11.toKalesijaLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.bus.line11.toKalesijaTimes.map((time, idx) => (
                      <span key={idx} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-800 border border-blue-200 shadow-2xs">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inbound to Tuzla */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 mb-2.5">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{t.bus.line11.toTuzlaLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.bus.line11.toTuzlaTimes.map((time, idx) => (
                      <span key={idx} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-800 border border-blue-200 shadow-2xs">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Only Highlight */}
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-xs sm:text-sm font-bold text-red-900 flex items-start gap-3">
              <Coins className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>{t.bus.cashWarning}</div>
            </div>

            {/* Taxi alternative */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 font-medium">
              💡 {t.bus.taxiAlternative}
            </div>
          </section>
        )}

        {/* SECTION 3: Entry & Border Requirements */}
        {(selectedFilter === 'all' || selectedFilter === 'entry') && (
          <section className="rounded-[1.75rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600">{t.entry.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.entry.title}</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {/* Border procedure */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-indigo-600" />
                  {t.entry.borderProcedures}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                  {t.entry.borderProceduresItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 24h Registration */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  {t.entry.registrationTitle}
                </h4>
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                  <p className="rounded-xl bg-white p-3 border border-slate-100">
                    <strong className="text-slate-900 font-bold block mb-1">🏨 Hotels:</strong>
                    {t.entry.hotelReg}
                  </p>
                  <p className="rounded-xl bg-white p-3 border border-slate-100">
                    <strong className="text-slate-900 font-bold block mb-1">🏠 Private Stays & Airbnb:</strong>
                    {t.entry.privateReg}
                  </p>
                </div>
              </div>
            </div>

            {/* Customs & 10,000 KM rule */}
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <h4 className="text-base font-black text-amber-950">{t.entry.customsTitle}</h4>
              <p className="mt-1 text-xs sm:text-sm font-medium text-amber-900 leading-relaxed">
                {t.entry.customsDesc}
              </p>
              <div className="mt-2 rounded-xl bg-white/80 p-3 text-xs sm:text-sm font-bold text-amber-950 border border-amber-200">
                💰 {t.entry.cashRule}
              </div>
            </div>

            {/* Non-EU Cases, UK, Balkans, Kosovo */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <h4 className="text-base font-black text-slate-900">{t.entry.specialCasesTitle}</h4>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-700">
                  {t.entry.ukRule}
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-700">
                  {t.entry.balkansRule}
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-700">
                  {t.entry.kosovoRule}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Health & Insurance */}
        {(selectedFilter === 'all' || selectedFilter === 'health') && (
          <section className="rounded-[1.75rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600">{t.health.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.health.title}</h3>
              </div>
            </div>

            {/* EHIC warning */}
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 p-5">
              <div className="text-sm sm:text-base font-black text-red-950">
                {t.health.ehicNotice}
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-red-900 leading-relaxed">
                {t.health.ehicDesc}
              </p>
              <p className="mt-2 text-xs sm:text-sm font-bold text-red-950">
                🛡️ {t.health.insuranceRecommendation}
              </p>
            </div>

            {/* Hospital & Clinics */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  {t.health.hospitalTitle}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t.health.hospitalDesc}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Private Clinics & Dentists
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t.health.clinicDesc}
                </p>
                <div className="mt-2 text-xs font-bold text-emerald-700">
                  ✓ {t.health.vaccines}
                </div>
              </div>
            </div>

            {/* Emergency Contacts with one-tap dialing */}
            <div className="mt-6">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3">
                {t.health.emergencyContactsTitle}
              </h4>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {t.health.emergencyList.map((contact) => (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:scale-[1.03] active:scale-95 shadow-sm ${contact.color}`}
                  >
                    <span className="text-2xl">{contact.icon}</span>
                    <span className="mt-1 text-2xl font-black">{contact.number}</span>
                    <span className="mt-0.5 text-[11px] font-bold text-center opacity-80">{contact.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: SIM, Wi-Fi & Money */}
        {(selectedFilter === 'all' || selectedFilter === 'simMoney') && (
          <section className="rounded-[1.75rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600">{t.simMoney.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.simMoney.title}</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {/* SIM & Data */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                  {t.simMoney.simTitle}
                </h4>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs sm:text-sm font-bold text-amber-950">
                  {t.simMoney.simWarning}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {t.simMoney.simOptions}
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <h5 className="text-xs font-black uppercase text-slate-500 mb-1 flex items-center gap-1.5">
                    <Wifi className="h-4 w-4 text-blue-600" />
                    {t.simMoney.wifiTitle}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t.simMoney.wifiDesc}
                  </p>
                </div>
              </div>

              {/* Currency & Cash */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  {t.simMoney.moneyTitle}
                </h4>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs sm:text-sm font-black text-blue-950">
                  {t.simMoney.peggedRate}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {t.simMoney.cashAdvice}
                </p>
                <div className="rounded-xl bg-white p-3.5 border border-slate-200 text-xs sm:text-sm text-slate-600 font-medium">
                  🏧 <strong className="text-slate-900">ATM Pro-tip:</strong> {t.simMoney.atmAdvice}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
