export interface MediaGuideSection {
  id: string;
  title: {
    bs: string;
    en: string;
  };
  subtitle?: {
    bs: string;
    en: string;
  };
  textBs?: string;
  textEn?: string;
  category?: string;
  highlights?: string[];
}

export interface MediaGuide {
  id: string;
  title: {
    bs: string;
    en: string;
  };
  description: {
    bs: string;
    en: string;
  };
  sourceFile: string;
  badge: {
    bs: string;
    en: string;
  };
  supportedLangs: ('bs' | 'en')[];
  defaultLang: 'bs' | 'en';
  sections: MediaGuideSection[];
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/^#+\s+/gm, '') // remove headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
    .replace(/\*(.*?)\*/g, '$1') // remove italics
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove markdown links
    .replace(/👉|🏛️|✈️|🏨|🍽️|🗺️|🌙|☀️|🌲|🛍️|🎙️|❤️|★|🔒|🎬|🧭/g, '') // remove emojis
    .replace(/---+/g, '') // remove horizontal lines
    .replace(/[•\-\*]\s+/g, '') // remove bullet points
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

export const TOUR_MEDIA_GUIDES: MediaGuide[] = [
  {
    id: 'city-guide',
    title: {
      bs: 'Tuzla Gradski Vodič (City Guide)',
      en: 'Tuzla City Guide',
    },
    description: {
      bs: 'Kompletan dvojezični turistički vodič sa svim glavnim znamenitostima, parkovima, kulturom i foto lokacijama.',
      en: 'Complete bilingual tourist guide featuring top landmarks, parks, culture, sacral sites and photo spots.',
    },
    sourceFile: 'TUZLACITYGUIDE.md',
    badge: {
      bs: 'Dvojezično (BS / EN)',
      en: 'Bilingual (BS / EN)',
    },
    supportedLangs: ['bs', 'en'],
    defaultLang: 'bs',
    sections: [
      {
        id: 'panonica-guide',
        category: 'Atrakcije / Attractions',
        title: {
          bs: '1. Panonska Jezera',
          en: '1. Pannonian Lakes',
        },
        textBs: 'Najpopularnija turistička atrakcija smještena u srcu grada je kompleks slanih Panonskih jezera, koji predstavlja slanu oazu i jedinstveno mjesto za kupanje i relaksaciju tokom vrelih ljetnih dana.',
        textEn: 'The most popular tourist attraction located in the heart of the city is the Complex of Pannonian Salt Lakes, which is a salty oasis and a unique site for swimming and relaxation during hot summer days.',
        highlights: ['Slana oaza', 'Centar grada', 'Ljetovalište'],
      },
      {
        id: 'tourist-train',
        category: 'Atrakcije / Attractions',
        title: {
          bs: 'Vožnja Turističkim Vozićem',
          en: 'Ride on the Touristic Train',
        },
        textBs: 'Od Trga slobode u centru grada do Panonskih jezera svakodnevno saobraća turistički vozić kapaciteta trideset šest mjesta. Tokom trajanja vožnje putnici se upoznaju sa znamenitostima grada kroz opis svih bitnih detalja i bogate turističke ponude.',
        textEn: 'The Touristic Train with a capacity of thirty-six seats runs daily from the Freedom Square in the city center to the Pannonian Lakes. During the ride, passengers get to know the sights of the city and hear all the important details about the rich touristic offer.',
        highlights: ['Trg slobode - Panonika', '36 mjesta', 'Audio opis'],
      },
      {
        id: 'city-park-tvrtko',
        category: 'Historija i Parkovi / History & Parks',
        title: {
          bs: '2. Gradski Park i Spomenik Kralju Tvrtku I(Prvom)',
          en: '2. City Park with the Statue of Tvrtko (The First) Kotromanić',
        },
        textBs: 'Povezan pješačkim mostom sa kompleksom Panonskih jezera, u samom centru Tuzle smjestio se i glavni Gradski park, bogat različitim spomenicima čija se tematika pretežno odnosi na srednjovjekovni period. Centralna figura parka je spomenik koji prikazuje Tvrtka I(Prvog) Kotromanića, bana i prvog kralja srednjovjekovne bosanske države. Pored ovog spomenika, u parku je moguće vidjeti i nekolicinu stećaka kao i spomenik na kome je uklesana povelja Kulina bana, najznačajniji dokument bosanske državnosti. Tvrtko I Kotromanić bio je bosanski ban od hiljadu tristo pedeset treće do hiljadu tristo sedamdeset sedme, te bosanski kralj od hiljadu tristo sedamdeset sedme do hiljadu tristo devedeset i prve.',
        textEn: 'The central City Park is located in the very heart of Tuzla and via a pedestrian bridge it is linked to the Pannonian Lakes. The park is rich in various monuments, mainly related to the medieval period. The central figure of the park is the statue depicting Tvrtko (The First) Kotromanić, Ban and the first King of the Medieval Bosnian State. Also, there are several stećak tombstones, as well as a monument with a display of engraved Charter of Kulin Ban, the most important document of Bosnian statehood. Tvrtko I Kotromanić ruled as Bosnian ban from one thousand three hundred fifty-three to one thousand three hundred seventy-seven, and as Bosnian king until one thousand three hundred ninety-one.',
        highlights: ['Povelja Kulina bana', 'Kralj Tvrtko (Prvi) Kotromanić', 'Stećci'],
      },
      {
        id: 'freedom-and-salt-square',
        category: 'Trgovi / Squares',
        title: {
          bs: '3. Trg Slobode i Soni Trg',
          en: '3. The Freedom Square and The Salt Square',
        },
        textBs: 'Trg slobode najveći je gradski trg u Bosni i Hercegovini, a njime dominira monumentalna zgrada Barok, vjerna replika izvorne zgrade podignute hiljadu devetstote godine povodom najavljene posjete austrougarskog prestolonasljednika Franca Ferdinanda. Centar historijskog dijela grada predstavlja Soni trg, oko kojeg se nižu deseci uskih granitom popločanih uličica odakle je počeo urbani razvoj grada.',
        textEn: 'The Freedom Square is the largest city square in Bosnia and Herzegovina, dominated by a monumental Baroque Building, a faithful replica of the original building erected in nineteen hundred on the occasion of the announced visit of the Austro-Hungarian heir to the throne, Franz Ferdinand. The center of the historical part of the city is the Salt Square, around which dozens of narrow granite-paved streets line up, where the urban development of the city began.',
        highlights: ['Zgrada Barok', 'Najveći trg u BiH', 'Soni trg'],
      },
      {
        id: 'slana-banja-park',
        category: 'Parkovi / Parks',
        title: {
          bs: '4. Slana Banja Park',
          en: '4. Slana Banja Park',
        },
        textBs: 'Slana banja je jedan od najprostranijih i najuređenijih parkova u Bosni i Hercegovini. Kompleks pored staza za šetnju obuhvata i teniske terene, igralište za mali nogomet i košarku, te spomen obilježlja iz novije istorije grada Tuzle. Okružena čistom prirodom, nudi predivan pogled sa vidikovca na Tuzlu.',
        textEn: 'Slana Banja park is one of the most spacious and structured parks in Bosnia and Herzegovina. In addition to walking trails, the complex includes tennis courts, an indoor soccer court, a basketball court, and memorials from the recent history of the city of Tuzla. Surrounded by pure nature, it offers a wonderful view of Tuzla from panoramic sites.',
        highlights: ['Rekreacija', 'Sportski tereni', 'Vidikovac'],
      },
      {
        id: 'ilincica-picnic',
        category: 'Priroda / Nature',
        title: {
          bs: '5. Izletište Ilinčica',
          en: '5. Ilinčica Picnic Area',
        },
        textBs: 'Izletište Ilinčica nazivaju još i pluća grada jer područje obiluje četinarskom i listopadnom šumom, pružajući posjetiteljima prostor za aktivnosti i zdrav život, ali i novi adrenalinski park. Ilinčica predstavlja dio ogranka planine Majevice, sa izuzetnom pejzažnom vrijednosti. Područje je bogato florom i faunom i kao takvo prirodno je stanište mnogobrojnih životinjskih vrsta.',
        textEn: 'The Ilinčica picnic area is also called the lungs of the city because this area is rich in coniferous and deciduous forest, providing visitors with space for various activities and healthy living. Ilinčica is part of the Majevica mountain range, with exceptional landscape value and rich flora and fauna.',
        highlights: ['Pluća grada', 'Planina Majevica', 'Gusta šuma'],
      },
      {
        id: 'art-and-culture-guide',
        category: 'Kultura / Culture',
        title: {
          bs: '6. Umjetnost i Kultura (Atelje i Galerija)',
          en: '6. Art and Culture (Atelier & Gallery)',
        },
        textBs: 'Međunarodni atelje Ismet Mujezinović jedinstven je po tome što je u njemu živio i radio jedan od najznačajnijih bosanskohercegovačkih slikara. Danas se u ateljeu nalazi spomen soba sa ličnim stvarima, a održavaju se izložbe i koncerti. Međunarodna galerija portreta u svom fundusu posjeduje preko pet hiljada djela najpoznatijih slikara bivše Jugoslavije i predstavlja svojevrsni muzej slikarstva.',
        textEn: 'The Ismet Mujezinović Atelier is unique because one of the most important Bosnian painters lived and worked there. Today it houses a memorial room with personal belongings and hosts exhibitions and concerts. The International Portrait Gallery has over five thousand fine art pieces from the former Yugoslavia and represents a renowned museum of fine art.',
        highlights: ['Ismet Mujezinović', '5000+ umjetnina', 'Galerija portreta'],
      },
      {
        id: 'rsd-sloboda-sport',
        category: 'Sport / Sports',
        title: {
          bs: '7. Kuća Sporta RSD Sloboda',
          en: '7. House of Sport RSD Sloboda',
        },
        textBs: 'Kuća sporta RSD Sloboda predstavlja spoj svojevrsne multimedijalne izložbe i sportskog arhiva u interaktivnoj muzejskoj postavci. Činjenice i legende o povezanosti grada Tuzle i Slobode oživljavaju emocije i uspomene kod svakog posjetitelja.',
        textEn: 'House of Sport RSD Sloboda is a combination of a multimedia exhibition and sports archive in an interactive museum-like setting. Facts and legends of the bond between Tuzla and Sloboda sports clubs revive emotions and memories.',
        highlights: ['Sportski arhiv', 'Legende Tuzle', 'RSD Sloboda'],
      },
      {
        id: 'husino-miner',
        category: 'Historija / History',
        title: {
          bs: '8. Spomenik Husinskom Rudaru',
          en: '8. Monument of the Husino Miner',
        },
        textBs: 'Husinski rudar je spomenik podignut u sjećanje na rudare koji su se borili za radnička prava i ravnopravnost u Husinskoj buni hiljadu devetsto dvadesete godine i jedan je od simbola Tuzle.',
        textEn: 'The Husino Miner is a monument erected in memory of the miners who fought for labor rights and equality in the Husino Uprising of nineteen twenty and is one of the enduring symbols of Tuzla.',
        highlights: ['Husinska buna 1920', 'Rudarski ponos', 'Simbol Tuzle'],
      },
      {
        id: 'language-and-literature',
        category: 'Književnost / Literature',
        title: {
          bs: '9. Jezik i Književnost',
          en: '9. Language and Literature',
        },
        textBs: 'Dom književnosti posvećen je književnicima Meši Selimoviću i Dervišu Sušiću koji su svojim radom vezani za Tuzlu. Ovaj muzej namijenjen je za promociju knjiga i izložbe slika. Kuća bosanskog jezika je stalna muzejska postavka posvećena bogatoj istoriji bosanskog jezika i kulture.',
        textEn: 'The House of Literature is dedicated to writers Meša Selimović and Derviš Sušić, closely connected to Tuzla through their life work. The House of the Bosnian Language is a permanent museum exhibition dedicated to the rich history of the Bosnian language and culture.',
        highlights: ['Meša Selimović', 'Derviš Sušić', 'Bosanski jezik'],
      },
      {
        id: 'sacral-buildings',
        category: 'Sakralni Objekti / Sacred Sites',
        title: {
          bs: '10. Sakralni Objekti Tuzle',
          en: '10. Sacred Architecture of Tuzla',
        },
        textBs: 'Džindijska džamija Huseina čauša je arhitektonski najvrednija džamija sa drvenom munarom na području Tuzle, građena od drveta iz hrastove šume.' + 'Saborni hram Uspenja Presvete Bogorodice je neoklasična pravoslavna crkva sagrađena krajem devetnaestog vijeka i nacionalni je spomenik.' + 'Franjevačka crkva i samostan svetog Petra i Pavla moderno je zdanje arhitekte Zlatka Ugljena sa galerijom Kristian Kreković.' + 'Gazi Turali-begova džamija u centru Tuzle izgrađena je hiljadu pet stotina sedamdeset druge godine sredstvima utemeljivača moderne urbane Tuzle.',
        textEn: 'Husein Čauš Džindijska Mosque is architecturally the most valuable mosque with a wooden minaret in Tuzla, preserved from oak forests.' + 'The Cathedral of the Assumption of the Blessed Virgin Mary is a 19th-century neoclassical Orthodox church and national monument.' + 'The Franciscan Church and Monastery of St. Peter and Paul is a modern masterpiece by architect Zlatko Ugljen.' + 'Gazi Turali-beg Mosque was built in fifteen seventy-two by the founder of urban Tuzla.',
        highlights: ['Džindijska džamija', 'Saborni hram', 'Franjevački samostan', 'Turali-begova džamija'],
      },
      {
        id: 'top-photo-locations',
        category: 'Foto Tačke / Photo Spots',
        title: {
          bs: 'Top Foto Lokacije (Meša i Ismet, Kicelj, I Love Tuzla)',
          en: 'Top Photo Locations (Meša & Ismet, Kicelj, I Love Tuzla)',
        },
        textBs: 'Spomenik Meši Selimoviću i Ismetu Mujezinoviću na Korzu omiljeno je mjesto susreta Tuzlaka. Vidikovac Kicelj u zagrljaju svjetlećeg trodimenzionalnog srca nudi najljepši panoramski pogled i zalaske sunca nad gradom. Znak I Love Tuzla pruža divnu uspomenu sa otvorenim srcem našega grada.',
        textEn: 'The monument to Meša Selimović and Ismet Mujezinović on Korzo is the favorite meeting place for locals. Kicelj panoramic viewpoint, embraced by an illuminated 3D LED heart, offers breathtaking sunset views over the entire valley. The I Love Tuzla sign sends love and memories to visitors worldwide.',
        highlights: ['Vidikovac Kicelj', 'Spomenik Meša i Ismet', 'I Love Tuzla'],
      },
      {
        id: 'photo-spots-heritage',
        category: 'Foto Tačke / Photo Spots',
        title: {
          bs: 'Znamenite Foto Tačke (Slapovi, Česma, Koza, Fontana)',
          en: 'Notable Photo Spots (Waterfalls, Fountain, Tuzla Goat)',
        },
        textBs: 'Panonski slapovi koji se ulijevaju u slana jezera osvježavaju duh i tijelo. Čaršijska česma je istorijski najznačajnije i najslikanije mjesto u gradu. Skulptura Tuzlanska koza podsjeća na čuvenu šaljivu legendu zbog koje je Tuzla opjevana. Velika fontana na Trgu slobode ukrašena je ornamentima srednjovjekovnih stećaka.',
        textEn: 'The salt waterfalls feeding the Pannonian lakes refresh spirit and body. The Čaršijska drinking fountain is one of the most photographed heritage sites. Tuzla Goat celebrates local humorous folklore and folk songs. The grand fountain at Freedom Square features carved medieval stećak ornaments.',
        highlights: ['Panonski slapovi', 'Čaršijska česma', 'Tuzlanska koza', 'Kamena fontana'],
      }
    ]
  }
];

