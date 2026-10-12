export interface CityGuideItem {
  id: string;
  themeNumber?: number;
  title: {
    bs: string;
    en: string;
    de?: string;
    tr?: string;
  };
  subtitle?: {
    bs: string;
    en: string;
  };
  audioText: {
    bs: string;
    en: string;
  };
  bsImage: string;
  enImage: string;
  planName: {
    bs: string;
    en: string;
  };
}

export const CITY_GUIDE_PAGES: CityGuideItem[] = [
  {
    id: 'intro-welcome',
    title: {
      bs: 'Dobrodošli u Tuzlu',
      en: 'Welcome to Tuzla'
    },
    subtitle: {
      bs: 'Grad soli, bogate historije i jedinstvenog duha',
      en: 'City of salt, rich history and unique spirit'
    },
    audioText: {
      bs: 'Dobrodošli u Tuzlu! Grad koji je nastao iz soli i koji već hiljadama godina čuva svoju posebnu priču. Tuzla je jedno od najstarijih kontinuirano naseljenih mjesta u Bosni i Hercegovini. Njena historija traje duže od šest hiljada godina. Sam naziv grada dolazi od turske riječi tuz – što znači so. Upravo so je oblikovala sudbinu Tuzle, od prahistorije pa sve do danas. Uživajte u obilasku!',
      en: 'Welcome to Tuzla! A city born from salt, preserving its unique story for thousands of years. Tuzla is one of the oldest continuously inhabited urban settlements in Bosnia and Herzegovina with over 6,000 years of history. Enjoy exploring our city guide!'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-1.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0001.webp',
    planName: {
      bs: 'Centar Tuzle',
      en: 'Tuzla Center'
    }
  },
  {
    id: 'panonska-jezera',
    themeNumber: 1,
    title: {
      bs: '1. Panonska Jezera',
      en: '1. Pannonian Lakes'
    },
    subtitle: {
      bs: 'Slana oaza u srcu grada',
      en: 'Salt oasis in the heart of the city'
    },
    audioText: {
      bs: 'Dobrodošli na Panonska slana jezera – jedino slano jezero u Evropi smješteno u samom centru grada! Ova jezera su nastala na mjestu nekadašnjih rudarskih crplilišta soli. Mineralna voda saliniteta sličnog morskom poznata je po svojim ljekovitim svojstvima. Pogledajte oko sebe – vidjet ćete slane slapove i rekonstruisano neolitsko sojeničko naselje. Ne propustite posjetiti i Geološki muzej.',
      en: 'Welcome to the Pannonian Salt Lakes – Europe’s only urban salt lake resort! Did you know these lakes were created over ancient salt mining craters? The mineral-rich water, with salinity like the sea, is famous for its healing effects. Look around – you’ll see cascading salt waterfalls and even a reconstructed Neolithic stilt village. Don’t miss the Geological Museum nearby.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-2.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0004.webp',
    planName: {
      bs: 'Panonska Jezera',
      en: 'Pannonian Lakes'
    }
  },
  {
    id: 'turisticki-vozic',
    title: {
      bs: 'Vožnja Turističkim Vozićem',
      en: 'Touristic Train Ride'
    },
    subtitle: {
      bs: 'Panoramska tura od Trga slobode do Panonike',
      en: 'Panoramic tour from Freedom Square to Pannonica'
    },
    audioText: {
      bs: 'Od Trga slobode u centru grada do Panonskih jezera svakodnevno saobraća turistički vozić kapaciteta 36 mjesta. Tokom trajanja vožnje putnici se upoznaju sa znamenitostima grada kroz opis svih bitnih detalja i bogate turističke ponude.',
      en: 'The Touristic Train with a capacity of 36 seats runs daily from Freedom Square to the Pannonian Lakes. During the ride, passengers get to know the sights of the city and hear all the important details about Tuzla\'s rich touristic offer.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-3.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0005.webp',
    planName: {
      bs: 'Turistički Vozić Tuzla',
      en: 'Tuzla Touristic Train'
    }
  },
  {
    id: 'gradski-park-tvrtko',
    themeNumber: 2,
    title: {
      bs: '2. Gradski Park i Kralj Tvrtko',
      en: '2. City Park & King Tvrtko'
    },
    subtitle: {
      bs: 'Spomenik Tvrtku I Kotromaniću i Povelja Kulina bana',
      en: 'Statue of Tvrtko I Kotromanić & Charter of Kulin Ban'
    },
    audioText: {
      bs: 'Dobrodošli u Gradski park, zelenu oazu u centru Tuzle povezanu pješačkim mostom sa Panonskim jezerima. U središtu parka ponosno stoji bronzani spomenik prvom bosanskom kralju Tvrtku I Kotromaniću. Park čuva i vjerne replike srednjovjekovnih stećaka, uklesanu Povelju Kulina bana, te popularni foto znak I Love Tuzla.',
      en: 'Welcome to City Park, a green oasis in downtown Tuzla. At its center stands the bronze statue of King Tvrtko I, Bosnia’s first medieval king. Around you, replica stećak tombstones recall Bosnia’s heritage, and the “I Love Tuzla” landmark is perfect for photos.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-4.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0006.webp',
    planName: {
      bs: 'Gradski Park i Spomenik Kralju Tvrtku',
      en: 'City Park & King Tvrtko Statue'
    }
  },
  {
    id: 'trg-slobode-soni-trg',
    themeNumber: 3,
    title: {
      bs: '3. Trg Slobode i Soni Trg',
      en: '3. Freedom Square & Salt Square'
    },
    subtitle: {
      bs: 'Historijsko jezgro i najveći trg u BiH',
      en: 'Historical core & largest square in BiH'
    },
    audioText: {
      bs: 'Dobrodošli na Trg slobode – najveći gradski trg u Bosni i Hercegovini! U središtu trga uočite fontanu inspirisanu tradicionalnom posudom za so, ukrašenu motivima srednjovjekovnih stećaka. Oko vas se prepliću austrougarska arhitektura zgrade Barok, osmanske uličice i živopisni kafići.',
      en: 'Welcome to Freedom Square – the largest city square in Bosnia and Herzegovina! At the center, notice the salt-shaped fountain decorated with medieval motifs. Around you, Austro-Hungarian architecture blends with Ottoman-era streets and lively cafés. This is the heart of Tuzla’s daily life.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-5.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0007.webp',
    planName: {
      bs: 'Trg Slobode i Soni Trg',
      en: 'Freedom Square and Salt Square'
    }
  },
  {
    id: 'slana-banja',
    themeNumber: 4,
    title: {
      bs: '4. Park Slana Banja',
      en: '4. Slana Banja Park'
    },
    subtitle: {
      bs: 'Šetališta, sportski tereni i panoramski vidikovac',
      en: 'Walking trails, sports courts and scenic viewpoint'
    },
    audioText: {
      bs: 'Slana banja je jedan od najprostranijih i najuređenijih parkova u Bosni i Hercegovini. Kompleks pored staza za šetnju obuhvata i teniske terene, igralište za mali nogomet i košarku, te spomen obilježlja iz novije istorije grada Tuzle. Okružena čistom prirodom, nudi predivan pogled sa vidikovca na Tuzlu.',
      en: 'Slana Banja park is one of the most spacious and structured parks in Bosnia and Herzegovina. In addition to the walking trails, the complex also includes tennis courts, sports grounds, and memorials from the recent history of the city of Tuzla. Surrounded by pure nature, it offers a wonderful panoramic view of Tuzla.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-6.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0008.webp',
    planName: {
      bs: 'Park Slana Banja',
      en: 'Slana Banja Park'
    }
  },
  {
    id: 'ilincica',
    themeNumber: 5,
    title: {
      bs: '5. Izletište Ilinčica',
      en: '5. Ilinčica Picnic Area'
    },
    subtitle: {
      bs: 'Pluća grada na obroncima Majevice',
      en: 'Lungs of the city on Majevica slopes'
    },
    audioText: {
      bs: 'Izletište Ilinčica nazivaju još i pluća grada jer područje obiluje četinarskom i listopadnom šumom, pružajući posjetiteljima prostor za aktivnosti i zdrav život. Ilinčica predstavlja dio ogranka planine Majevice, sa izuzetnom pejzažnom vrijednosti. Područje je bogato florom i faunom i kao takvo prirodno je stanište mnogobrojnih životinjskih vrsta.',
      en: 'The Ilinčica picnic area is also called the lungs of the city because this area is rich in coniferous and deciduous forest, providing visitors with space for various activities, promoting a healthy lifestyle. Ilinčica is part of the Majevica mountain range, rich in biodiversity and scenic viewpoints.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-7.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0009.webp',
    planName: {
      bs: 'Izletište Ilinčica',
      en: 'Ilincica Hill Picnic Area'
    }
  },
  {
    id: 'umjetnost-kultura',
    themeNumber: 6,
    title: {
      bs: '6. Umjetnost i Kultura',
      en: '6. Art and Culture'
    },
    subtitle: {
      bs: 'Atelje Ismet Mujezinović & Međunarodna Galerija Portreta',
      en: 'Ismet Mujezinović Atelier & International Portrait Gallery'
    },
    audioText: {
      bs: 'Međunarodni atelje Ismet Mujezinović jedinstven je po tome što je u njemu živio i stvarao slikar Ismet Mujezinović, a danas sadrži spomen sobu sa ličnim stvarima, slikama i održava koncerte i izložbe. Međunarodna galerija portreta posjeduje preko 5.000 djela najpoznatijih umjetnika sa područja bivše Jugoslavije i predstavlja vrhunski muzej slikarstva.',
      en: 'The Ismet Mujezinović Atelier is unique because one of the most important Bosnian painters lived and worked there, featuring an authentic memorial room and exhibition venue. The International Portrait Gallery holds over 5,000 fine art pieces by the most famous painters from former Yugoslavia, serving as a prestigious fine arts museum.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-8.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0010.webp',
    planName: {
      bs: 'Atelje Mujezinović i Galerija Portreta',
      en: 'Mujezinovic Atelier & Portrait Gallery'
    }
  },
  {
    id: 'sport-husinski-rudar',
    themeNumber: 7,
    title: {
      bs: '7. Kuća Sporta & Husinski Rudar',
      en: '7. House of Sport & Husino Miner'
    },
    subtitle: {
      bs: 'RSD Sloboda 1919 & Spomenik radničkoj borbi',
      en: 'RSD Sloboda 1919 & Miners struggle monument'
    },
    audioText: {
      bs: 'Kuća sporta RSD Sloboda predstavlja spoj svojevrsne multimedijalne izložbe i sportskog arhiva u interaktivnoj muzejskoj postavci. Husinski rudar je monumentalni spomenik podignut u sjećanje na rudare koji su se borili za radnička prava i ravnopravnost u Husinskoj buni 1920. godine i jedan je od najvažnijih simbola Tuzle.',
      en: 'Sports Association RSD Sloboda House of Sport combines a multimedia exhibition and sports archives in an interactive setting. The Husino Miner is a monument erected in memory of the miners who fought for labor rights and equality in the Husino Uprising of 1920 and is one of the most renowned symbols of Tuzla.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-9.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0011.webp',
    planName: {
      bs: 'Kuća Sporta Sloboda & Husinski Rudar',
      en: 'House of Sport Sloboda & Husino Miner'
    }
  },
  {
    id: 'jezik-knjizevnost',
    themeNumber: 9,
    title: {
      bs: '9. Jezik i Književnost',
      en: '9. Language and Literature'
    },
    subtitle: {
      bs: 'Dom Književnosti & Kuća Bosanskog Jezika',
      en: 'House of Literature & House of Bosnian Language'
    },
    audioText: {
      bs: 'Dom književnosti posvećen je velikanima pisane riječi Meši Selimoviću i Dervišu Sušiću koji su svojim životnim radom i djelom vezani za Tuzlu. Kuća bosanskog jezika je stalna muzejska postavka posvećena bogatoj hiljadugodišnjoj istoriji bosanskog jezika i pismenosti.',
      en: 'The House of Literature is dedicated to legendary writers Meša Selimović and Derviš Sušić, whose life and works are intertwined with Tuzla. The House of the Bosnian Language is a permanent exhibition dedicated to the rich history and literacy of the Bosnian language through the centuries.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-10.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0012.webp',
    planName: {
      bs: 'Dom Književnosti & Kuća Bosanskog Jezika',
      en: 'House of Literature & Bosnian Language'
    }
  },
  {
    id: 'sakralni-objekti',
    themeNumber: 10,
    title: {
      bs: '10. Sakralni Objekti',
      en: '10. Places of Worship'
    },
    subtitle: {
      bs: 'Džindijska, Saborni Hram, Franjevački Samostan, Turali-begova',
      en: 'Džindijska, Orthodox Cathedral, Franciscan Monastery, Turali-beg'
    },
    audioText: {
      bs: 'Džindijska džamija arhitektonski je najvrednija džamija sa drvenom munarom i očuvanim primjerom izvorne bosanske arhitekture. Saborni hram Uspenja Presvete Bogorodice iz 19. vijeka u neoklasicističkom stilu, Franjevačka crkva i samostan Sv. Petra i Pavla sa Galerijom Kristian Kreković, te Gazi Turali-begova džamija iz hiljadupetstotina sedamdeset i druge (1572.) godine svjedoče o višestoljetnom suživotu.',
      en: 'Džindijska Mosque is architecturally the most valuable mosque with an authentic wooden minaret. The Neoclassical 19th-century Orthodox Cathedral of the Assumption, the Franciscan Church and Monastery of St. Peter and Paul with the Kristian Kreković Gallery, and Gazi Turali-beg Mosque from fifteen seventy-two (1572.) demonstrate Tuzla centuries of multicultural coexistence.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-11.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0013.webp',
    planName: {
      bs: 'Sakralni Objekti Tuzle',
      en: 'Places of Worship Tuzla'
    }
  },
  {
    id: 'top-photo-locations',
    title: {
      bs: 'Top Foto Lokacije',
      en: 'Top Photo Locations'
    },
    subtitle: {
      bs: 'Meša i Ismet, Vidikovac Kicelj, I Love Tuzla',
      en: 'Meša & Ismet Statue, Kicelj Viewpoint, I Love Tuzla'
    },
    audioText: {
      bs: 'Napravite jedinstvenu fotografiju u društvu dvojice prijatelja Meše Selimovića i Ismeta Mujezinovića, posjetite vidikovac Kicelj u zagrljaju svjetlećeg srca sa pogledom na zalazak sunca, ili pošaljite poruke ljubavi fotografijom uz otvoreno srce i znak I Love Tuzla.',
      en: 'Take a unique photo with the monument of two friends Meša Selimović and Ismet Mujezinović, visit the Kicelj panoramic viewpoint with its luminous 3D heart and sunset view, or send love messages with photos at the iconic I Love Tuzla sign.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-12.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0014.webp',
    planName: {
      bs: 'Top Foto Lokacije (Kicelj & Meša-Ismet)',
      en: 'Top Photo Locations Tuzla'
    }
  },
  {
    id: 'more-photo-spots',
    title: {
      bs: 'Još Foto Lokacija',
      en: 'More Photo Spots'
    },
    subtitle: {
      bs: 'Slapovi Panonike, Čaršijska Česma, Tuzlanska Koza, Fontana',
      en: 'Salt Waterfalls, Fountain, Tuzla Goat, Freedom Square'
    },
    audioText: {
      bs: 'Pružite pogled na grad sa slanih slapova Panonike, fotografišite se kod historijske Čaršijske česme, nasmijte prijatelje uz legendarnu skulpturu Tuzlanske koze, i zabilježite trenutak na fontani Trga slobode sa ornamentima srednjovjekovnih stećaka.',
      en: 'Enjoy the view from the salt waterfalls at Pannonica, snap a photo by the historical Čaršijska drinking fountain, discover the folklore of Tuzla Goat statue, and admire the Freedom Square fountain decorated with authentic medieval stećak motifs.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-13.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0015.webp',
    planName: {
      bs: 'Foto Tačke (Slapovi, Koza, Fontana)',
      en: 'Photo Spots Tuzla'
    }
  },
  {
    id: 'kalendar-manifestacija',
    title: {
      bs: 'Godišnji Kalendar Manifestacija',
      en: 'Annual Calendar of Events'
    },
    subtitle: {
      bs: 'Kulturni i muzički festivali tokom cijele godine',
      en: 'Cultural and musical festivals year-round'
    },
    audioText: {
      bs: 'Tuzla obiluje cjelogodišnjim manifestacijama: od TKT Festa, Dana piva i Festivala savremenih žena u proljeće, ljetnih festivala Kaleidoskop, Džumbus, Sezone na Panonici i Bike Festa, do jesenjih književnih susreta Cum Grano Salis, Tuzla Film Festivala i Zime u Tuzli na Trgu slobode.',
      en: 'Tuzla hosts dynamic festivals throughout the entire year: TKT Theatre Fest, Beer Days, Modern Women Festival, summer festivals like Kaleidoskop, Džumbus, Pannonica season, Bike Fest, autumn literature festival Cum Grano Salis, Tuzla Film Festival, and Winter in Tuzla celebrations.'
    },
    bsImage: '/assets/Gallery/City Guide/GradTuzla-14.webp',
    enImage: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0016.webp',
    planName: {
      bs: 'Kalendar Manifestacija Tuzla',
      en: 'Tuzla Events Calendar'
    }
  }
];
