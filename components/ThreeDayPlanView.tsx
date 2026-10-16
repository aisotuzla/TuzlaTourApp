import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Plane,
  Sparkles,
  Utensils,
  Hotel,
  Sun,
  Trees,
  ShoppingBag,
  Bus,
  RotateCcw,
  Info
} from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { Language } from '../types';

interface ThreeDayPlanViewProps {
  lang: Language;
  onSwitchToPracticalInfo?: () => void;
}

interface Milestone {
  id: string;
  day: 1 | 2 | 3;
  time: string;
  category: 'transit' | 'hotel' | 'food' | 'quest' | 'lakes' | 'nature' | 'shopping';
  title: string;
  description: string;
  points: string[];
  tip?: string;
  actionLabel?: string;
  actionType?: 'practicalInfo' | 'food' | 'accommodation' | 'quest';
}

const STORAGE_KEY = 'tuzla_3day_plan_completed_milestones';

export const ThreeDayPlanView: React.FC<ThreeDayPlanViewProps> = ({
  lang,
  onSwitchToPracticalInfo,
}) => {
  const [activeDay, setActiveDay] = useState<number>(0); // 0 = all, 1 = day 1, 2 = day 2, 3 = day 3
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (value) {
          setCompletedIds(JSON.parse(value));
        }
      } catch {
        // ignore
      }
    };
    loadProgress();
  }, []);

  const toggleMilestone = async (id: string) => {
    const updated = completedIds.includes(id)
      ? completedIds.filter((item) => item !== id)
      : [...completedIds, id];
    setCompletedIds(updated);
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updated) });
  };

  const resetProgress = async () => {
    if (window.confirm(lang === 'bs' ? 'Poništiti napredak plana?' : 'Reset itinerary progress?')) {
      setCompletedIds([]);
      await Preferences.remove({ key: STORAGE_KEY });
    }
  };

  const copy = {
    en: {
      badge: 'Curated 72-Hour Experience',
      title: '3-Day Tuzla Itinerary',
      subtitle: 'A step-by-step crafted itinerary through historical squares, Europe’s only salt lakes, local cuisine, scenic nature viewpoints, and shopping.',
      allDays: 'All 3 Days',
      day1: 'Day 1: Arrival & First Steps',
      day2: 'Day 2: Salt Lakes & Old Town',
      day3: 'Day 3: Nature, Shopping & Departure',
      progressTitle: 'Trip Completion',
      resetBtn: 'Reset checklist',
      openPracticalGuideNotice: 'Arriving via Tuzla Airport (TZL)? Check direct flights, Line 11 bus, entry rules, SIMs and currency info.',
      openPracticalGuideBtn: 'View Practical Travel Info',
      thanksTitle: 'Thank you for visiting Tuzla!',
      thanksSubtitle: 'Have a safe journey and visit us again anytime. Sretan put!',
      categories: {
        transit: 'Transit & Flight',
        hotel: 'Accommodation',
        food: 'Food & Dining',
        quest: 'Quest & Culture',
        lakes: 'Lakes & Wellness',
        nature: 'Nature & Views',
        shopping: 'Shopping & Leisure',
      },
      milestones: [
        // DAY 1
        {
          id: 'd1_flight',
          day: 1,
          time: 'Morning / Arrival',
          category: 'transit',
          title: 'Landing at Tuzla International Airport (TZL)',
          description: 'Arrive at TZL in Dubrave Gornje and start your Tuzla exploration smoothly.',
          points: [
            'Open Tuzla Tour Guide to access transit routes and local guides',
            'Take official Airport Taxi (~30–40 BAM / €15–20) or walk ~800 m to Dubrave Gornje for local Bus Line 11 (4.50 BAM cash only)',
            'Reach Tuzla city center in approximately 20–50 minutes',
          ],
          tip: 'Tip: Bus Line 11 requires exact change in BAM (KM). See our Practical Info section for route and schedule details.',
          actionLabel: 'Airport & Bus Guide',
          actionType: 'practicalInfo',
        },
        {
          id: 'd1_hotel',
          day: 1,
          time: 'Midday',
          category: 'hotel',
          title: 'Hotel Check-in & Stay Registration',
          description: 'Settle into your central accommodation and get refreshed.',
          points: [
            'Open Accommodation in the app to check hotel addresses and direct contacts',
            'Present your passport at reception — hotels automatically submit your 24h stay registration (prijava boravka)',
            'Use the in-app Smart Navigation to route effortlessly to your hotel',
          ],
          tip: 'Tip: Central hotels (Grand Hotel Tuzla, Hotel Mellain, Tehnograd, Heartland City) place you within minutes of the main promenade.',
        },
        {
          id: 'd1_lunch',
          day: 1,
          time: '13:30 - Lunch',
          category: 'food',
          title: 'Authentic Bosnian Lunch',
          description: 'Taste world-famous Tuzla ćevapi or traditional savory pies (pita).',
          points: [
            'Visit famed local establishments like Ćevabdžinica Limenka or Restoran Čaršijska Česma',
            'Order a 10-piece ćevapi in fresh somun with kajmak and onions',
            'Or order direct delivery via the Food section of the app',
          ],
          tip: 'Tip: Pair your meal with local yogurt or mineral water. Most traditional ćevapdžinice prefer cash.',
        },
        {
          id: 'd1_quest',
          day: 1,
          time: '16:00 - Afternoon',
          category: 'quest',
          title: 'Interactive City Quest & Old Town Discovery',
          description: 'Explore Tuzla’s historic heart, monuments, and unlock rewards.',
          points: [
            'Open the Quest tab and follow the interactive map to key historical sites',
            'Visit Trg Slobode (Freedom Square), the fountain, and the monument to Ismet Mujezinović & Meša Selimović',
            'Scan digital QR codes on location to unlock partner discounts in your Digital Wallet',
          ],
          tip: 'Tip: Keep scanned discount coupons in your Wallet for bakeries, coffee shops, and desserts.',
        },
        {
          id: 'd1_dinner',
          day: 1,
          time: '20:00 - Evening',
          category: 'food',
          title: 'Relaxed Dinner & Evening Promenade (Korzo)',
          description: 'Experience Tuzla’s vibrant pedestrian street life.',
          points: [
            'Dine at Kapija restaurant, Tavern Zlatnik, or your hotel restaurant',
            'Stroll along the pedestrian Korzo lined with Austro-Hungarian facades and cozy cafes',
            'Enjoy traditional Bosnian coffee served in a dzezva with rahat lokum',
          ],
        },

        // DAY 2
        {
          id: 'd2_pannonica',
          day: 2,
          time: '09:00 - Morning',
          category: 'lakes',
          title: 'Panonska Jezera (Pannonian Salt Lakes)',
          description: 'Swim in the only artificial salt lakes inside a city center in all of Europe.',
          points: [
            'Navigate to Pannonica via the in-app map (just 5 minutes walk from Trg Slobode)',
            'Best advice: Arrive early around 08:30–09:30 AM when water is most pristine and loungers are readily available',
            'Operating hours: 08:00 – 20:00 (summer season); Day ticket ≈ 7.50 BAM',
            'Visit the on-site Neolithic Stilt House Settlement (Sojeničko naselje) and geological salt museum for free',
          ],
          tip: 'Tip: Bring swimwear, sandals, and a towel. The water has proven therapeutic and mineral qualities.',
        },
        {
          id: 'd2_lunch_bagi',
          day: 2,
          time: '13:30 - Lunch & Dessert',
          category: 'food',
          title: 'Lunch at Panonski Lovac & Pancakes at Palačinkara Bagi',
          description: 'Recharge with hearty lakeside dishes and Tuzla’s favorite sweet treat.',
          points: [
            'Enjoy a delicious lunch right by the water at Restoran Panonski Lovac',
            'Stroll into the pedestrian zone to Palačinkara Bagi for dessert',
            'Scan the QR code at Bagi in the app to claim a special discount on premium sweet or savory pancakes',
          ],
          tip: 'Tip: Try Nutella-banana or Kinder Bueno fillings with crushed Plazma biscuit!',
        },
        {
          id: 'd2_old_town',
          day: 2,
          time: '16:30 - Afternoon',
          category: 'quest',
          title: 'Stari Grad Heritage & Soni Trg (Salt Square)',
          description: 'Immerse in Tuzla’s ancient salt heritage spanning over 7,000 years.',
          points: [
            'Walk across Soni Trg to see the salt extraction monument and archaeological displays',
            'Admire the Turali-beg Mosque with its unique stone minaret and historic stone arches',
            'Look for interactive QR codes at partner locations for hidden surprises in the app',
          ],
        },
        {
          id: 'd2_dinner',
          day: 2,
          time: '20:00 - Evening',
          category: 'food',
          title: 'Local Craft Beer & Evening Socializing',
          description: 'Unwind at a local brewery or craft pub.',
          points: [
            'Visit Tuzlanska Pivara (Pivnica) to taste freshly brewed Tuzlanski pilsner',
            'Sample traditional meza platters with smoked beef (suho meso) and Travnik cheese',
            'Prepare for day three’s nature excursion',
          ],
        },

        // DAY 3
        {
          id: 'd3_ilincica',
          day: 3,
          time: '09:30 - Morning',
          category: 'nature',
          title: 'Ilinčica Forest Park & Scenic Viewpoint',
          description: 'Breathe crisp pine air and enjoy panoramic vistas overlooking the entire Tuzla valley.',
          points: [
            'Open the in-app Map and launch navigation up towards Ilinčica hill (accessible by taxi or 30m uphill hike)',
            'Explore marked woodland trails, the adrenaline park, and modern picnic pavilions',
            'Pack a light picnic or coffee in a thermos to enjoy at the panoramic viewpoint',
          ],
          tip: 'Tip: Perfect morning photography spot capturing the whole city between Majevica and Konjuh hills.',
        },
        {
          id: 'd3_bcc',
          day: 3,
          time: '13:30 - Afternoon',
          category: 'shopping',
          title: 'Shopping & Relaxation at Bingo City Center (BCC)',
          description: 'Browse the region’s premier modern shopping mall.',
          points: [
            'Head to Bingo City Center (BCC) on Mitara Trifunovića Uče',
            'Shop for local Bosnian delicacies (honey, suho meso, craft coffee) and international fashion brands',
            'Relax with artisan coffee and sweet treats in the bright atrium cafes',
            'Scan partner QR codes in mall boutiques to enter contests or earn badges',
          ],
          tip: 'Tip: BCC also features an exchange booth (mjenjačnica), ATMs, and hypermarket for travel snacks.',
        },
        {
          id: 'd3_departure',
          day: 3,
          time: 'Late Afternoon / Evening',
          category: 'transit',
          title: 'Departure: Bus Line 11 or Taxi to TZL Airport',
          description: 'Head back to Tuzla International Airport for your flight.',
          points: [
            'Check your flight departure time and plan to arrive at TZL 2 hours prior to takeoff',
            'Book a taxi directly from your hotel or take Bus Line 11 from the Tuzla bus station to Dubrave Gornje',
            'Check real-time bus timetables in the app and prepare 4.50 BAM cash for the driver',
          ],
          tip: 'Tip: Airport security and passport check can have queues during simultaneous Wizz Air departures. Double-check your gate on the screens.',
          actionLabel: 'Airport & Bus Guide',
          actionType: 'practicalInfo',
        },
      ] as Milestone[],
    },
    bs: {
      badge: 'Preporučeni 72-satni program',
      title: '3-Dnevni plan obilaska Tuzle',
      subtitle: 'Pažljivo osmišljen itinerar kroz historijske trgove, jedinstvena slana jezera u Evropi, domaću gastronomiju, izletište Ilinčica i shopping.',
      allDays: 'Sva 3 dana',
      day1: 'Dan 1: Dolazak i prvi koraci',
      day2: 'Dan 2: Panonska jezera i Stari grad',
      day3: 'Dan 3: Priroda, shopping i polazak',
      progressTitle: 'Napredak obilaska',
      resetBtn: 'Poništi kvačice',
      openPracticalGuideNotice: 'Slijećete na Aerodrom Tuzla (TZL)? Pogledajte letove, autobusku liniju 11, prijavu boravka, internet i valutu.',
      openPracticalGuideBtn: 'Pogledaj praktične info',
      thanksTitle: 'Hvala na posjeti Tuzli!',
      thanksSubtitle: 'Želimo vam siguran povratak i dođite nam ponovo. Sretan put!',
      categories: {
        transit: 'Prevoz i let',
        hotel: 'Smještaj',
        food: 'Hrana i piće',
        quest: 'Potraga i kultura',
        lakes: 'Jezera i odmor',
        nature: 'Priroda i vidikovac',
        shopping: 'Kupovina i relaksacija',
      },
      milestones: [
        // DAN 1
        {
          id: 'd1_flight',
          day: 1,
          time: 'Jutro / Dolazak',
          category: 'transit',
          title: 'Slijetanje na Međunarodni aerodrom Tuzla (TZL)',
          description: 'Slijetanje u Dubravama i brz transfer do centra grada.',
          points: [
            'Otvorite Tuzla Tour Guide aplikaciju za rute i taksi kontakte',
            'Pozovite aerodromski taksi (~30–40 KM) ili prošetajte ~800 m do Dubrava Gornjih na autobus Linija 11 (4.50 KM)',
            'Stignite u centar Tuzle za 20 do 50 minuta',
          ],
          tip: 'Savjet: Za autobusku liniju 11 obavezno pripremite tačan iznos od 4.50 KM u gotovini.',
          actionLabel: 'Vodič za aerodrom i bus',
          actionType: 'practicalInfo',
        },
        {
          id: 'd1_hotel',
          day: 1,
          time: 'Sredina dana',
          category: 'hotel',
          title: 'Prijava u smještaj i registracija boravka',
          description: 'Smjestite se i odmorite od putovanja.',
          points: [
            'Otvorite tab "Smještaj" u aplikaciji za pregled hotela i direktan poziv',
            'Pokažite pasoš na recepciji — hoteli automatski vrše zakonsku prijavu boravka unutar 24h',
            'Koristite "Smart navigaciju" za jednostavan dolazak do hotela',
          ],
          tip: 'Savjet: Hoteli u centru (Grand Hotel Tuzla, Hotel Mellain, Heartland City) su na nekoliko koraka od glavnog šetališta.',
        },
        {
          id: 'd1_lunch',
          day: 1,
          time: '13:30 - Ručak',
          category: 'food',
          title: 'Domaći tuzlanski ćevapi i pite',
          description: 'Probajte čuvene tuzlanske ćevape u somunu natopljenom poljevom.',
          points: [
            'Posjetite tradicionalne ćevabdžinice poput Limenke ili restorana Čaršijska Česma',
            'Naručite desetku u somunu s kajmakom i lukom',
            'Ili naručite brzu dostavu direktno na vašu lokaciju putem taba "Hrana"',
          ],
          tip: 'Savjet: Tradicionalne ćevabdžinice preferiraju plaćanje u gotovini (KM).',
        },
        {
          id: 'd1_quest',
          day: 1,
          time: '16:00 - Popodne',
          category: 'quest',
          title: 'Interaktivna potraga i upoznavanje grada',
          description: 'Istražite historijske znamenitosti i osvojite popuste.',
          points: [
            'Otvorite tab "Potraga" i pratite mapu ka historijskim tačkama',
            'Posjetite Trg Slobode, fontanu i spomenik Ismetu Mujezinoviću i Meši Selimoviću',
            'Skenirajte QR kodove na lokacijama i sačuvajte digitalne kupone u svom digitalnom novčaniku',
          ],
          tip: 'Savjet: Osvojene kupone možete iskoristiti za deserte i kafu u partnerskim objektima.',
        },
        {
          id: 'd1_dinner',
          day: 1,
          time: '20:00 - Večera',
          category: 'food',
          title: 'Večera i šetnja kroz Korzo',
          description: 'Uživajte u večernjoj atmosferi gradskog šetališta.',
          points: [
            'Večerajte u restoranu Zlatnik, Kapija ili hotelskom restoranu',
            'Prošetajte pješačkom zonom Korzo okruženom austrougarskom arhitekturom',
            'Popijte tradicionalnu bosansku kafu posluženu u džezvi s rahat-lokumom',
          ],
        },

        // DAN 2
        {
          id: 'd2_pannonica',
          day: 2,
          time: '09:00 - Jutro',
          category: 'lakes',
          title: 'Panonska jezera — Jedinstveno slano kupalište',
          description: 'Kupanje u jedinim slanim jezerima u centru grada u Evropi.',
          points: [
            'Otvorite mapu i uputite se ka Panonskim jezerima (5 min pješke od Trga Slobode)',
            'Savjet: Dođite što ranije (08:30–09:30) dok je voda najbistrija i ima slobodnih ležaljki',
            'Radno vrijeme: 08:00 – 20:00; Cijena cjelodnevne ulaznice: 7.50 KM',
            'Besplatno obiđite Arheološki park Neolitsko sojeničko naselje i geološki muzej soli',
          ],
          tip: 'Savjet: Ponesite kupaći kostim, papuče i peškir. Slana ljekovita voda izuzetno godi koži i disajnim putevima.',
        },
        {
          id: 'd2_lunch_bagi',
          day: 2,
          time: '13:30 - Ručak i desert',
          category: 'food',
          title: 'Ručak u Panonskom Lovcu i palačinke u Bagi',
          description: 'Spoj ukusnog ručka uz jezero i najboljih palačinaka u gradu.',
          points: [
            'Ručajte specijalitete u restoranu Panonski Lovac uz samu obalu jezera',
            'Za desert prošetajte do Palačinkare Bagi u gradskoj zoni',
            'Skenirajte QR kod na lokaciji kroz aplikaciju i ostvarite popust na porciju palačinaka!',
          ],
          tip: 'Savjet: Isprobajte kombinaciju Nutella, plazma keks i svježe voće.',
        },
        {
          id: 'd2_old_town',
          day: 2,
          time: '16:30 - Popodne',
          category: 'quest',
          title: 'Stari Grad i Soni Trg',
          description: 'Otkrijte tradiciju vađenja soli dugu preko 7.000 godina.',
          points: [
            'Prošetajte do Sonog Trga s replikom neolitske posude za kuhanje slanice',
            'Pogledajte Turali-begovu džamiju s jedinstvenim kamenim minaretom',
            'Potražite skrivene QR kodove za dodatna iznenađenja u aplikaciji',
          ],
        },
        {
          id: 'd2_dinner',
          day: 2,
          time: '20:00 - Večera',
          category: 'food',
          title: 'Tuzlansko pivo i večernje druženje',
          description: 'Opustite se u autentičnoj gradskoj pivnici.',
          points: [
            'Posjetite Pivnicu Tuzlanske pivare i probajte svježe točeni Tuzlanski pilsner',
            'Probajte bosansku mezu sa suhim mesom i sirom',
            'Pripremite se za sutrašnji izlet u prirodu',
          ],
        },

        // DAN 3
        {
          id: 'd3_ilincica',
          day: 3,
          time: '09:30 - Jutro',
          category: 'nature',
          title: 'Izletište i vidikovac Ilinčica',
          description: 'Uživajte u adrenalinskom parku, borovoj šumi i panorami Tuzle.',
          points: [
            'Otvorite navigaciju ka izletištu Ilinčica (10 min taksijem ili lagana šetnja uzbrdo)',
            'Uživajte u uređenim stazama za šetnju, hladovini i adrenalinskom parku',
            'Preporuka: Ponesite osvježenje i uživajte u pikniku na vidikovcu s pogledom na cijeli grad',
          ],
          tip: 'Savjet: Izvrsno mjesto za jutarnje fotografije Tuzle okupane suncem.',
        },
        {
          id: 'd3_bcc',
          day: 3,
          time: '13:30 - Popodne',
          category: 'shopping',
          title: 'Shopping i odmor u Bingo City Center (BCC)',
          description: 'Najveći i najmoderniji tržni centar u regiji.',
          points: [
            'Posjetite Bingo City Center (BCC) ili RK Tuzlanku u centru',
            'Kupite domaće proizvode, suvenire, lokalni med i poznatu tuzlansku so',
            'Opustite se uz kafu i kolače u modernim kafeterijama',
            'Skenirajte QR kodove na partnerskim lokacijama za nagrade',
          ],
          tip: 'Savjet: U BCC-u imate bankomate, mjenjačnicu i veliki hipermarket za sve što vam zatreba za put.',
        },
        {
          id: 'd3_departure',
          day: 3,
          time: 'Kasno popodne / Večer',
          category: 'transit',
          title: 'Povratak na aerodrom TZL: Linija 11 ili Taksi',
          description: 'Udoban i pravovremen polazak na let.',
          points: [
            'Provjerite vrijeme leta — na aerodrom TZL stignite najmanje 2 sata ranije',
            'Pozovite taksi ili potražite autobusku Liniju 11 koja vozi do Dubrava Gornjih',
            'Pripremite 4.50 KM u gotovini za kartu ukoliko putujete autobusom',
          ],
          tip: 'Savjet: Zbog pasoške kontrole u vršnim satima letova, imajte pasoš spreman za izlazni pečat.',
          actionLabel: 'Vodič za aerodrom i bus',
          actionType: 'practicalInfo',
        },
      ] as Milestone[],
    },
    de: {
      badge: 'Kuratierter 72-Stunden-Reiseplan',
      title: '3-Tage-Plan für Tuzla',
      subtitle: 'Ein detailreicher Reiseplan durch historische Altstadtplätze, Europas einzige innerstädtische Salzseen, lokale Küche, das Naturgebiet Ilinčica und Shopping.',
      allDays: 'Alle 3 Tage',
      day1: 'Tag 1: Ankunft & Erste Eindrücke',
      day2: 'Tag 2: Salzseen & Altstadt',
      day3: 'Tag 3: Natur, Shopping & Abreise',
      progressTitle: 'Reisefortschritt',
      resetBtn: 'Checkliste zurücksetzen',
      openPracticalGuideNotice: 'Ankunft am Flughafen Tuzla (TZL)? Alle Infos zu Flügen, Buslinie 11, Einreise, SIM-Karten und Währung.',
      openPracticalGuideBtn: 'Praktische Infos anzeigen',
      thanksTitle: 'Vielen Dank für Ihren Besuch in Tuzla!',
      thanksSubtitle: 'Gute Heimreise und kommen Sie bald wieder! Sretan put!',
      categories: {
        transit: 'Transfer & Flug',
        hotel: 'Unterkunft',
        food: 'Essen & Trinken',
        quest: 'Quest & Kultur',
        lakes: 'Salzseen & Wellness',
        nature: 'Natur & Aussicht',
        shopping: 'Shopping & Freizeit',
      },
      milestones: [
        {
          id: 'd1_flight',
          day: 1,
          time: 'Vormittag / Ankunft',
          category: 'transit',
          title: 'Landung am Flughafen Tuzla (TZL)',
          description: 'Reibungsloser Start und Transfer vom Flughafen in die Innenstadt.',
          points: [
            'Öffnen Sie die Tuzla Tour Guide App für Transfer und Routen',
            'Nehmen Sie ein offizielles Flughafentaxi (~30–40 KM / 15–20 €) oder gehen Sie ~800 m nach Dubrave Gornje für die Buslinie 11 (4.50 KM nur Barzahlung)',
            'Fahrzeit ins Zentrum beträgt etwa 20–50 Minuten',
          ],
          tip: 'Tipp: Halten Sie für den Bus 11 unbedingt 4.50 KM passend in bar bereit.',
          actionLabel: 'Flughafen & Bus Guide',
          actionType: 'practicalInfo',
        },
        {
          id: 'd1_hotel',
          day: 1,
          time: 'Mittags',
          category: 'hotel',
          title: 'Hotel Check-in & Meldepflicht',
          description: 'Einchecken im Hotel und kurzes Frischmachen.',
          points: [
            'Unterkunftstab in der App aufrufen für direkte Kontakte und Routen',
            'Legen Sie Ihren Reisepass an der Rezeption vor — Hotels erledigen die 24h-Meldung automatisch',
            'Nutzen Sie die Smart Navigation für den Fußweg ins Zentrum',
          ],
        },
        {
          id: 'd1_lunch',
          day: 1,
          time: '13:30 - Mittagessen',
          category: 'food',
          title: 'Authentische bosnische Ćevapi',
          description: 'Probieren Sie die traditionellen Ćevapi im feinen Somun-Brot.',
          points: [
            'Besuchen Sie die Traditionslokale Ćevabdžinica Limenka oder Čaršijska Česma',
            'Bestellen Sie eine 10er-Portion mit Kajmak und frischen Zwiebeln',
            'Oder nutzen Sie den Essens-Tab für Lieferservice',
          ],
        },
        {
          id: 'd1_quest',
          day: 1,
          time: '16:00 - Nachmittag',
          category: 'quest',
          title: 'Stadt-Quest & Altstadterkundung',
          description: 'Historische Plätze entdecken und Rabatte sichern.',
          points: [
            'Quest-Tab öffnen und zur interaktiven Karte navigieren',
            'Besuchen Sie den Trg Slobode (Freiheitsplatz) und das Denkmal von Ismet & Meša',
            'Scannen Sie QR-Codes vor Ort und speichern Sie Gutscheine in Ihrer Wallet',
          ],
        },
        {
          id: 'd1_dinner',
          day: 1,
          time: '20:00 - Abendessen',
          category: 'food',
          title: 'Abendessen & Flanieren auf dem Korzo',
          description: 'Genießen Sie das abendliche Treiben auf der Flaniermeile.',
          points: [
            'Essen im Restaurant Kapija, Zlatnik oder im Hotelrestaurant',
            'Spaziergang über die Fußgängerzone Korzo',
            'Traditionellen bosnischen Kaffee aus der Džezva genießen',
          ],
        },
        {
          id: 'd2_pannonica',
          day: 2,
          time: '09:00 - Vormittag',
          category: 'lakes',
          title: 'Panonska Jezera (Pannonische Salzseen)',
          description: 'Baden in Europas einzigem innerstädtischen Salzwasser-Badesee.',
          points: [
            'Nur 5 Minuten Fußweg vom Freiheitsplatz zu den Salzseen',
            'Empfehlung: Früh kommen (08:30–09:30), wenn das Wasser am klarsten ist',
            'Öffnungszeiten: 08:00 – 20:00 Uhr; Tageskarte ca. 7.50 KM',
            'Kostenloser Besuch des Pfahlbautendorfes und des Salzmuseums',
          ],
          tip: 'Tipp: Badesachen, Handtuch und Flip-Flops mitnehmen. Das heilsame Salzwasser ist wohltuend für Haut und Atemwege.',
        },
        {
          id: 'd2_lunch_bagi',
          day: 2,
          time: '13:30 - Mittag & Dessert',
          category: 'food',
          title: 'Restaurant Panonski Lovac & Pfannkuchen bei Bagi',
          description: 'Köstliches Essen am See und die besten Crêpes der Stadt.',
          points: [
            'Mittagessen direkt am See im Restaurant Panonski Lovac',
            'Für den Nachtisch zu Palačinkara Bagi spazieren',
            'QR-Code scannen und Rabatt auf süße Pfannkuchen erhalten',
          ],
        },
        {
          id: 'd2_old_town',
          day: 2,
          time: '16:30 - Nachmittag',
          category: 'quest',
          title: 'Salzplatz (Soni Trg) & Kulturerbe',
          description: 'Über 7.000 Jahre Salzgewinnungstradition entdecken.',
          points: [
            'Spazieren Sie über den Soni Trg mit seinen Salzbrunnen',
            'Besichtigen Sie die historische Turali-Beg-Moschee',
            'QR-Codes für In-App Überraschungen scannen',
          ],
        },
        {
          id: 'd2_dinner',
          day: 2,
          time: '20:00 - Abend',
          category: 'food',
          title: 'Tuzlaer Brauhaus & Geselligkeit',
          description: 'Frisch gebrautes Bier in der historischen Pivnica.',
          points: [
            'Pivnica der Tuzlanska Pivara besuchen und kühles Pilsner probieren',
            'Bosnische Meza mit Rauchfleisch und Käse genießen',
          ],
        },
        {
          id: 'd3_ilincica',
          day: 3,
          time: '09:30 - Vormittag',
          category: 'nature',
          title: 'Naturpark & Aussichtspunkt Ilinčica',
          description: 'Waldwege, Adrenalinpark und Panoramablick über Tuzla.',
          points: [
            'Navigation zum Ausflugsziel Ilinčica starten (per Taxi oder Fußweg)',
            'Im Schatten der Wälder wandern und den Adrenalinpark erkunden',
            'Picknick mit Blick über das gesamte Tal genießen',
          ],
        },
        {
          id: 'd3_bcc',
          day: 3,
          time: '13:30 - Nachmittag',
          category: 'shopping',
          title: 'Shopping im Bingo City Center (BCC)',
          description: 'Das größte Einkaufszentrum der Region erkunden.',
          points: [
            'BCC oder RK Tuzlanka besuchen',
            'Lokale Spezialitäten (Honig, Salz, Souvenirs) einkaufen',
            'Kaffee und Kuchen in den hellen Passagen genießen',
          ],
        },
        {
          id: 'd3_departure',
          day: 3,
          time: 'Spätnachmittag / Abend',
          category: 'transit',
          title: 'Abreise: Bus Linie 11 oder Taxi zum TZL Flughafen',
          description: 'Pünktliche Rückfahrt zum Flughafen Tuzla.',
          points: [
            'Rechtzeitig 2 Stunden vor Abflug am Flughafen eintreffen',
            'Taxi rufen oder Buslinie 11 nach Dubrave Gornje nutzen',
            '4.50 KM in bar für den Busfahrer bereithalten',
          ],
          actionLabel: 'Flughafen & Bus Guide',
          actionType: 'practicalInfo',
        },
      ] as Milestone[],
    },
    tr: {
      badge: 'Özel 72 Saatlik Gezi Programı',
      title: '3 Günlük Tuzla Gezi Planı',
      subtitle: 'Tarihi meydanlar, Avrupa’nın tek şehir içi tuz gölleri, leziz Boşnak mutfağı, Ilinčica doğa parkı ve alışverişi kapsayan kapsamlı gezi rehberi.',
      allDays: 'Tüm 3 Gün',
      day1: '1. Gün: Varış ve İlk Adımlar',
      day2: '2. Gün: Tuz Gölleri ve Eski Şehir',
      day3: '3. Gün: Doğa, Alışveriş ve Dönüş',
      progressTitle: 'Gezi İlerlemesi',
      resetBtn: 'İşaretleri sıfırla',
      openPracticalGuideNotice: 'Tuzla Havalimanı’na (TZL) mı iniyorsunuz? Uçuşlar, 11 nolu otobüs, konaklama kaydı ve para birimi bilgileri.',
      openPracticalGuideBtn: 'Pratik Bilgileri Gör',
      thanksTitle: 'Tuzla’yı ziyaret ettiğiniz için teşekkürler!',
      thanksSubtitle: 'İyi yolculuklar dileriz, tekrar bekleriz! Sretan put!',
      categories: {
        transit: 'Ulaşım & Uçuş',
        hotel: 'Konaklama',
        food: 'Yeme & İçme',
        quest: 'Görev & Kültür',
        lakes: 'Tuz Gölleri & Dinlenme',
        nature: 'Doğa & Manzara',
        shopping: 'Alışveriş & Dinlenme',
      },
      milestones: [
        {
          id: 'd1_flight',
          day: 1,
          time: 'Sabah / Varış',
          category: 'transit',
          title: 'Tuzla Uluslararası Havalimanı’na (TZL) İniş',
          description: 'Havalimanından merkeze hızlı ve sorunsuz transfer.',
          points: [
            'Rotalar ve taksi iletişimi için Tuzla Tour Guide uygulamasını açın',
            'Resmi havalimanı taksisi (~30–40 KM) veya 800 metre yürüyerek Dubrave Gornje durağından 11 nolu otobüse binin (4.50 KM nakit)',
            '20 ila 50 dakika içinde Tuzla merkezine ulaşın',
          ],
          tip: 'İpucu: 11 nolu otobüs için yanınızda tam 4.50 KM nakit bulundurun.',
          actionLabel: 'Havalimanı & Otobüs Rehberi',
          actionType: 'practicalInfo',
        },
        {
          id: 'd1_hotel',
          day: 1,
          time: 'Öğle',
          category: 'hotel',
          title: 'Otele Giriş ve Konaklama Bildirimi',
          description: 'Odanıza yerleşip dinlenin.',
          points: [
            'Otel adresleri ve iletişim için uygulamadaki "Konaklama" sekmesine bakın',
            'Pasaportunuzu resepsiyona verin — oteller 24 saatlik yasal bildirimi otomatik yapar',
            'Merkeze yürümek için Akıllı Navigasyonu kullanın',
          ],
        },
        {
          id: 'd1_lunch',
          day: 1,
          time: '13:30 - Öğle Yemeği',
          category: 'food',
          title: 'Meşhur Boşnak Köftesi (Ćevapi)',
          description: 'Tuzla usulü somun ekmekli lezzetli köfteleri tadın.',
          points: [
            'Limenka veya Čaršijska Česma gibi geleneksel köftecileri ziyaret edin',
            'Kaymak ve soğan eşliğinde 10’lu köfte sipariş edin',
            'Veya "Yemek" sekmesinden doğrudan bulunduğunuz yere sipariş verin',
          ],
        },
        {
          id: 'd1_quest',
          day: 1,
          time: '16:00 - Öğleden Sonra',
          category: 'quest',
          title: 'Şehir Görevi ve Tarihi Keşif',
          description: 'Şehrin tarihi noktalarını gezip dijital indirimler kazanın.',
          points: [
            'Uygulamadaki Görev sekmesini açıp interaktif haritayı takip edin',
            'Özgürlük Meydanı (Trg Slobode) ve Ismet & Meša anıtını görün',
            'QR kodları tarayarak Dijital Cüzdanınızda indirim kuponları biriktirin',
          ],
        },
        {
          id: 'd1_dinner',
          day: 1,
          time: '20:00 - Akşam',
          category: 'food',
          title: 'Akşam Yemeği ve Korzo Yürüyüşü',
          description: 'Tuzla’nın canlı yürüyüş caddesini keşfedin.',
          points: [
            'Kapija veya Zlatnik restoranında akşam yemeği yiyin',
            'Tarihi binalarla çevrili Korzo caddesinde yürüyün',
            'Lokum eşliğinde cezvede sunulan geleneksel Boşnak kahvesini için',
          ],
        },
        {
          id: 'd2_pannonica',
          day: 2,
          time: '09:00 - Sabah',
          category: 'lakes',
          title: 'Panonska Jezera (Panonika Tuz Gölleri)',
          description: 'Avrupa’nın tek şehir içi yapay tuz göllerinde yüzme keyfi.',
          points: [
            'Özgürlük Meydanı’ndan sadece 5 dakikalık yürüyüşle göllere ulaşın',
            'Tavsiye: Suyun en berrak olduğu sabah 08:30–09:30 arası gidin',
            'Çalışma saatleri: 08:00 – 20:00; Günlük giriş yaklaşık 7.50 KM',
            'Neolitik kazıklı köy yerleşimini ve jeoloji müzesini ücretsiz gezin',
          ],
          tip: 'İpucu: Mayonuzu, terliğinizi ve havlunuzu yanınıza alın. Şifalı tuzlu su cilde ve solunum yollarına çok iyi gelir.',
        },
        {
          id: 'd2_lunch_bagi',
          day: 2,
          time: '13:30 - Öğle & Tatlı',
          category: 'food',
          title: 'Panonski Lovac’ta Yemek ve Bagi’de Krep',
          description: 'Göl kenarında keyifli öğle yemeği ve leziz krepler.',
          points: [
            'Göl kıyısındaki Panonski Lovac restoranında yemek yiyin',
            'Tatlı için yakındaki Palačinkara Bagi’ye yürüyün',
            'Uygulamadan Bagi’deki QR kodu okutup krepte özel indirim kazanın!',
          ],
        },
        {
          id: 'd2_old_town',
          day: 2,
          time: '16:30 - Öğleden Sonra',
          category: 'quest',
          title: 'Eski Şehir ve Tuz Meydanı (Soni Trg)',
          description: '7.000 yıllık tuz üretim geçmişini keşfedin.',
          points: [
            'Tuz Meydanı’ndaki arkeolojik kalıntıları ve çeşmeyi görün',
            'Taş minareli tarihi Turali Bey Camii’ni ziyaret edin',
            'Uygulamadaki sürprizler için QR kodları arayın',
          ],
        },
        {
          id: 'd2_dinner',
          day: 2,
          time: '20:00 - Akşam',
          category: 'food',
          title: 'Tuzla Bira Evi ve Sohbet',
          description: 'Tarihi bira evinde taze bira keyfi.',
          points: [
            'Tuzlanska Pivara bira evine gidip taze fıçı biraları tadın',
            'Kuru et ve yöresel peynirlerden oluşan Boşnak mezesini deneyin',
          ],
        },
        {
          id: 'd3_ilincica',
          day: 3,
          time: '09:30 - Sabah',
          category: 'nature',
          title: 'Ilinčica Doğa Parkı ve Seyir Tepesi',
          description: 'Çam ormanları, adrenalin parkı ve panoramik Tuzla manzarası.',
          points: [
            'Ilinčica parkına navigasyonu açın (taksiyle 10 dk veya yürüyüş yolu)',
            'Yürüyüş parkurlarında dolaşıp doğanın tadını çıkarın',
            'Tüm şehri kuşbakışı gören seyir noktasında piknik yapın',
          ],
        },
        {
          id: 'd3_bcc',
          day: 3,
          time: '13:30 - Öğleden Sonra',
          category: 'shopping',
          title: 'Bingo City Center’da (BCC) Alışveriş',
          description: 'Bölgenin en büyük ve en modern alışveriş merkezi.',
          points: [
            'BCC veya şehir merkezindeki RK Tuzlanka’yı gezin',
            'Yöresel bal, kuru et ve meşhur Tuzla tuzu gibi hediyelikler alın',
            'Geniş kafelerde kahve eşliğinde dinlenin',
          ],
        },
        {
          id: 'd3_departure',
          day: 3,
          time: 'Akşama Doğru',
          category: 'transit',
          title: 'Dönüş: 11 Nolu Otobüs veya Taksiyle Havalimanına',
          description: 'Havalimanına rahat ve zamanında ulaşım.',
          points: [
            'Uçuş saatinden en az 2 saat önce TZL havalimanında olun',
            'Taksi çağırın veya otogardan Dubrave Gornje’ye giden 11 nolu otobüse binin',
            'Otobüs için 4.50 KM nakit parayı hazır tutun',
          ],
          actionLabel: 'Havalimanı & Otobüs Rehberi',
          actionType: 'practicalInfo',
        },
      ] as Milestone[],
    },
  };

  const t = copy[lang] ?? copy.en;

  const filteredMilestones =
    activeDay === 0 ? t.milestones : t.milestones.filter((m) => m.day === activeDay);

  const completedCount = t.milestones.filter((m) => completedIds.includes(m.id)).length;
  const progressPercent = Math.round((completedCount / t.milestones.length) * 100);

  const getCategoryIcon = (cat: Milestone['category']) => {
    switch (cat) {
      case 'transit':
        return <Plane className="h-4 w-4 text-blue-600" />;
      case 'hotel':
        return <Hotel className="h-4 w-4 text-indigo-600" />;
      case 'food':
        return <Utensils className="h-4 w-4 text-amber-600" />;
      case 'quest':
        return <Compass className="h-4 w-4 text-purple-600" />;
      case 'lakes':
        return <Sun className="h-4 w-4 text-cyan-600" />;
      case 'nature':
        return <Trees className="h-4 w-4 text-emerald-600" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4 text-pink-600" />;
      default:
        return <MapPin className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Notice: Switch to Practical Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-cyan-900">
              {lang === 'bs' ? 'Planirate dolazak letom?' : lang === 'de' ? 'Fluganreise nach Tuzla?' : lang === 'tr' ? 'Uçuşla mı geliyorsunuz?' : 'Planning Your Arrival?'}
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-700">
              {t.openPracticalGuideNotice}
            </p>
          </div>
        </div>

        {onSwitchToPracticalInfo && (
          <button
            onClick={onSwitchToPracticalInfo}
            className="inline-flex items-center gap-2 shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-cyan-300" />
            {t.openPracticalGuideBtn}
          </button>
        )}
      </div>

      {/* Hero Header */}
      <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/30">
              <Calendar className="h-3.5 w-3.5" />
              {t.badge}
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">{t.title}</h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-blue-100/80 leading-relaxed font-medium">
              {t.subtitle}
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-cyan-200">
              <span>{t.progressTitle}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {completedCount} <span className="text-sm font-normal text-white/60">/ {t.milestones.length}</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {completedCount > 0 && (
              <button
                onClick={resetProgress}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-white/70 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                {t.resetBtn}
              </button>
            )}
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveDay(0)}
            className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black transition-all ${
              activeDay === 0
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {t.allDays}
          </button>
          <button
            onClick={() => setActiveDay(1)}
            className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black transition-all ${
              activeDay === 1
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {t.day1}
          </button>
          <button
            onClick={() => setActiveDay(2)}
            className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black transition-all ${
              activeDay === 2
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {t.day2}
          </button>
          <button
            onClick={() => setActiveDay(3)}
            className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-black transition-all ${
              activeDay === 3
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {t.day3}
          </button>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {filteredMilestones.map((milestone) => {
          const isDone = completedIds.includes(milestone.id);

          return (
            <div
              key={milestone.id}
              className={`rounded-[1.75rem] border transition-all p-5 sm:p-6 shadow-sm ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/40 opacity-90'
                  : 'border-slate-200/90 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Interactive Completion Checkbox */}
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-110 active:scale-95"
                    aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-7 w-7 text-slate-300 hover:text-blue-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    {/* Header tags: Day, Time, Category */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-800">
                        Day {milestone.day}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Clock className="h-3 w-3" />
                        {milestone.time}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {getCategoryIcon(milestone.category)}
                        {t.categories[milestone.category]}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`mt-2 text-lg sm:text-xl font-black ${
                        isDone ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {milestone.title}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                      {milestone.description}
                    </p>

                    {/* Actionable points */}
                    <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                      {milestone.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Contextual Tip */}
                    {milestone.tip && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs sm:text-sm font-semibold text-amber-950">
                        💡 {milestone.tip}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Action Button */}
                {milestone.actionLabel && milestone.actionType === 'practicalInfo' && onSwitchToPracticalInfo && (
                  <button
                    onClick={onSwitchToPracticalInfo}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors self-end sm:self-start"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>{milestone.actionLabel}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Friendly farewell card */}
      <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-6 sm:p-8 text-center shadow-sm">
        <h4 className="text-xl sm:text-2xl font-black text-slate-900">{t.thanksTitle}</h4>
        <p className="mt-1 text-sm sm:text-base font-semibold text-slate-600">
          {t.thanksSubtitle}
        </p>
      </div>
    </div>
  );
};
