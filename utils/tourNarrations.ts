/**
 * Structured Modular Location Narrations for Tuzla Tour App
 * Derived from TuzlaENtext_tts.md and HistoryBA.md
 */

export interface TourNarrationItem {
  id: string;
  title: {
    bs: string;
    en: string;
  };
  category: 'History' | 'Nature' | 'Culture' | 'Memorial' | 'Gastronomy' | 'Viewpoint';
  text: {
    bs: string;
    en: string;
  };
  proTip: {
    bs: string;
    en: string;
  };
  durationSeconds: number;
  coordinates?: [number, number]; // [lng, lat]
}

export const TOUR_NARRATIONS: TourNarrationItem[] = [
  {
    id: 'pannonian-lakes',
    title: {
      bs: 'Panonska Slana Jezera',
      en: 'Pannonian Salt Lakes Complex'
    },
    category: 'Nature',
    text: {
      bs: 'Dobrodošli na Panonska slana jezera – jedino slano jezero u Evropi smješteno u samom centru grada! Ova jezera su nastala na mjestu nekadašnjih rudarskih crplilišta soli. Mineralna voda saliniteta sličnog morskom poznata je po svojim ljekovitim svojstvima. Pogledajte oko sebe – vidjet ćete slane slapove i rekonstruisano neolitsko sojeničko naselje. Ne propustite posjetiti i Geološki muzej.',
      en: 'Welcome to the Pannonian Salt Lakes – Europe’s only urban salt lake resort! Did you know these lakes were created over ancient salt mining craters? The mineral-rich water, with salinity like the sea, is famous for its healing effects. Look around – you’ll see cascading salt waterfalls and even a reconstructed Neolithic stilt village. Don’t miss the Geological Museum nearby.'
    },
    proTip: {
      bs: 'Dođite rano ujutro za najbistriju vodu i mirno kupanje.',
      en: 'Arrive early in the morning for the clearest water and a peaceful swim.'
    },
    durationSeconds: 38,
    coordinates: [18.6811, 44.5385]
  },
  {
    id: 'freedom-square',
    title: {
      bs: 'Trg Slobode & Soni Trg',
      en: 'Freedom Square & Salt Square'
    },
    category: 'Culture',
    text: {
      bs: 'Dobrodošli na Trg slobode – najveći gradski trg u Bosni i Hercegovini! U središtu trga uočite fontanu inspirisanu tradicionalnom posudom za so, ukrašenu motivima srednjovjekovnih stećaka. Oko vas se prepliću austrougarska arhitektura zgrade Barok, osmanske uličice i živopisni kafići.',
      en: 'Welcome to Freedom Square – the largest city square in Bosnia and Herzegovina! At the center, notice the salt-shaped fountain decorated with medieval motifs. Around you, Austro-Hungarian architecture blends with Ottoman-era streets and lively cafés. This is the heart of Tuzla’s daily life. Take a moment to explore the underground archaeological displays beneath the square.'
    },
    proTip: {
      bs: 'Popijte kafu u jednoj od ljetnih bašta i posmatrajte kako grad oživljava.',
      en: 'Grab a coffee at one of the open-air cafés and watch the city come alive.'
    },
    durationSeconds: 40,
    coordinates: [18.6775, 44.5402]
  },
  {
    id: 'kapija-memorial',
    title: {
      bs: 'Memorijalno Mjesto Kapija',
      en: 'Kapija Memorial & Gateway'
    },
    category: 'Memorial',
    text: {
      bs: 'Nalazite se na Kapiji, historijskom ulazu u staro gradsko jezgro Tuzle. Na Dan mladosti, dvadeset petog maja 1995. godine, artiljerijska granata je pogodila ovo omiljeno okupljalište i ugasila sedamdeset i jedan mladi život. Danas spomen-ploča sa stihovima Maka Dizdara i zid sjećanja čuvaju trajnu uspomenu i svjedoče o posvećenosti Tuzle miru i zajedništvu.',
      en: 'You are now at Kapija, a solemn gateway with deep meaning. On May 25, 1995, this spot was struck by artillery, killing 71 young people. Today, the memorial plaque and commemorative wall honor their memory. Look closely at the poem by Mak Dizdar – it speaks of resilience and peace.'
    },
    proTip: {
      bs: 'Posjetite Kapiju u večernjim satima u mirnoj i dostojanstvenoj atmosferi.',
      en: 'Visit in the evening when the atmosphere is quiet, allowing you to reflect on Tuzla’s spirit of unity.'
    },
    durationSeconds: 42,
    coordinates: [18.6756, 44.5410]
  },
  {
    id: 'city-park-tvrtko',
    title: {
      bs: 'Gradski Park & Spomenik Kralju Tvrtku',
      en: 'City Park & King Tvrtko I Statue'
    },
    category: 'History',
    text: {
      bs: 'Dobrodošli u Gradski park, zelenu oazu u centru Tuzle povezanu pješačkim mostom sa Panonskim jezerima. U središtu parka ponosno stoji bronzani spomenik prvom bosanskom kralju Tvrtku I Kotromaniću. Park čuva i vjerne replike srednjovjekovnih stećaka, uklesanu Povelju Kulina bana, te popularni foto znak I Love Tuzla.',
      en: 'Welcome to City Park, a green oasis in downtown Tuzla. At its center stands the bronze statue of King Tvrtko I, Bosnia’s first medieval king. Around you, replica stećak tombstones recall Bosnia’s heritage, and the “I Love Tuzla” landmark is perfect for photos.'
    },
    proTip: {
      bs: 'Pređite pješački most koji direktno spaja park sa slanim jezerima.',
      en: 'Cross the pedestrian bridge to the Pannonian Lakes for a seamless nature-to-city experience.'
    },
    durationSeconds: 36,
    coordinates: [18.6800, 44.5392]
  },
  {
    id: 'old-town-korzo',
    title: {
      bs: 'Stari Grad & Šetalište Korzo',
      en: 'Old Town & Korzo Avenue'
    },
    category: 'Culture',
    text: {
      bs: 'Zakoračite u stari grad Tuzle! Korzo je glavna pješačka žila kucavica, okružena šarenim fasadama iz doba secesije, slastičarnama i pekarama. Tlo pod vašim nogama vijekovima je oblikovano crpljenjem slane vode. Potražite skulpturu velikana Meše Selimovića i Ismeta Mujezinovića, omiljeno mjesto za susrete.',
      en: 'Step into Tuzla’s Old Town! Korzo, the main pedestrian street, is lined with colorful Austro-Hungarian facades, bakeries, and boutique shops. Notice the unique street contours – they were shaped by centuries of salt mining beneath the ground. Look for the bronze monument of Meša Selimović and Ismet Mujezinović, a popular meeting spot.'
    },
    proTip: {
      bs: 'Pogledajte stari gradski sat sa četiri lica u Turalibegovoj ulici.',
      en: 'Check out the vintage four-faced clock on Turalibegova street – it’s a local icon.'
    },
    durationSeconds: 40,
    coordinates: [18.6765, 44.5406]
  },
  {
    id: 'turalibeg-mosque',
    title: {
      bs: 'Gazi Turali-begova (Poljska) Džamija',
      en: 'Turalibegova / Poljska Mosque'
    },
    category: 'Culture',
    text: {
      bs: 'Ovo je Gazi Turali-begova džamija, izgrađena davne 1572. godine. Zbog slijeganja tla usljed eksploatacije soli, džamija je decenijama tonula ispod nivoa ceste. Jedinstvenim arhitektonskim projektom 2007. godine objekat je podignut i obnovljen, spojivši izvorno osmansko kamenje i drvo sa savremenim staklenim plohama.',
      en: 'This is Turalibegova Mosque, built in the 16th century. Due to salt subsidence, the mosque sank below ground level, but a remarkable restoration in 2007 raised it again. Notice how the original Ottoman stone and wood blend with modern glass walls.'
    },
    proTip: {
      bs: 'Posjetite džamiju pri zalasku sunca kada stakleni elementi reflektuju zlatnu svjetlost.',
      en: 'Visit at sunset when the glass reflects golden light, creating a magical view.'
    },
    durationSeconds: 38,
    coordinates: [18.6815, 44.5378]
  },
  {
    id: 'orthodox-cathedral',
    title: {
      bs: 'Saborni Hram Uspenja Presvete Bogorodice',
      en: 'Cathedral of the Dormition of the Mother of God'
    },
    category: 'Culture',
    text: {
      bs: 'Dobrodošli u Saborni hram, sagrađen između 1874. i 1882. godine. Sa svojim neoklasičnim stilom, plavim kupolama i raskošnim ikonostasom, proglašen je nacionalnim spomenikom Bosne i Hercegovine i svjedoči o bogatoj duhovnoj baštini grada.',
      en: 'Welcome to Tuzla’s Orthodox Cathedral, built between 1874 and 1882. Its neoclassical design, bright blue onion domes, and intricate frescoes make it a national monument. Step inside to admire the three-tiered iconostasis.'
    },
    proTip: {
      bs: 'Pogledajte zvonike koji se prekrasno ocrtavaju na večernjem nebu nasuprot gradskog parka.',
      en: 'Look up at the towers – they shine beautifully against the evening sky opposite the city park.'
    },
    durationSeconds: 36,
    coordinates: [18.6822, 44.5401]
  },
  {
    id: 'slana-banja-park',
    title: {
      bs: 'Park Slana Banja & Vidikovac',
      en: 'Slana Banja Memorial & Recreational Park'
    },
    category: 'Nature',
    text: {
      bs: 'Slana banja je prostrani šumoviti park na brdu iznad jezera. Spaja rekreaciju i historijsko sjećanje, sa stazama za šetnju, teniskim terenima, partizanskim spomen-obilježjima i crkvom Svetog Georgija skrivenom među stoljetnim drvećem.',
      en: 'This is Slana Banja, a forested hilltop park overlooking the lakes. It’s both a recreational area and a memorial site. Walk the trails, play sports, or visit monuments dedicated to WWII fighters and Kapija victims. Hidden among the trees is St. George’s Orthodox Church.'
    },
    proTip: {
      bs: 'Ponesite udobnu obuću – šumske staze su savršene za opuštajući zalazak sunca.',
      en: 'Bring comfortable shoes – the trails are perfect for a sunset walk.'
    },
    durationSeconds: 38,
    coordinates: [18.6865, 44.5412]
  },
  {
    id: 'kicelj-viewpoint',
    title: {
      bs: 'Vidikovac Kicelj',
      en: 'Kicelj Panoramic Viewpoint'
    },
    category: 'Viewpoint',
    text: {
      bs: 'Dobrodošli na vidikovac Kicelj, najpoznatiju panoramsku tačku Tuzle. Odavde se pruža pogled od tri stotine i šezdeset stepeni na čitavu tuzlansku kotlinu, krovove starog grada i slana jezera. Prepoznatljiv je po velikom 3D svjetlećem srcu.',
      en: 'Welcome to Kicelj, Tuzla’s panoramic hilltop. From here, you get a 360-degree view of the valley, Old Town rooftops, and the shimmering lakes. Notice the illuminated LED heart sign – a favorite photo spot.'
    },
    proTip: {
      bs: 'Dođite u sumrak za najljepše boje neba i fotografije zalaska sunca nad gradom.',
      en: 'Come at sunset for breathtaking colors over the city.'
    },
    durationSeconds: 35,
    coordinates: [18.6710, 44.5435]
  },
  {
    id: 'tuzla-gastronomy',
    title: {
      bs: 'Tuzlanska Gastronomija & Ćevapi',
      en: 'Local Gastronomy & Tuzla Ćevapi'
    },
    category: 'Gastronomy',
    text: {
      bs: 'Nijedan obilazak Tuzle nije potpun bez domaće kuhinje! Tuzlanski ćevapi su posebni – poslužuju se u sočnom somunu natopljenom toplom goveđom polivkom. Probajte ih u kultnoj Limenci pored jezera. Ne propustite ni tuzlansku pitu, kao ni Tuzlansko pivo iz jedne od najstarijih pivara u regiji osnovane 1884. godine.',
      en: 'No tour is complete without food! Tuzla’s ćevapi are unique – served in somun bread soaked in rich broth. Try them at Limenka near the lakes. Tuzlanska pita, a thin-crust savory pie, is another must. And don’t miss Tuzlanska Pivara, one of Bosnia’s oldest breweries, famous for its pilsner.'
    },
    proTip: {
      bs: 'Naručite desetku sa polivkom i kajmakom za autentičan tuzlanski doživljaj.',
      en: 'Pair your meal with a local beer for the full Tuzla experience.'
    },
    durationSeconds: 40,
    coordinates: [18.6805, 44.5370]
  }
];
