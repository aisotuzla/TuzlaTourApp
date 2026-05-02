/**
 * Tuzla Hotel Data – Verified accommodation listings
 * Sources: Booking.com, TripAdvisor, official hotel websites (verified March 2025)
 */

export interface HotelData {
  name: string;
  description: { en: string; bs: string; de: string };
  rating: number;
  user_ratings_total: number;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  website?: string;
  image?: string;
  extraImage?: string;
  extraLink?: string;
  priceRange: string;
  amenities: string[];
}

export const tuzlaHotelData: HotelData[] = [
  {
    name: 'Hotel Mellain',
    description: {
      en: 'Upscale hotel with modern amenities, spa center, and elegant rooms in the heart of Tuzla.',
      bs: 'Luksuzni hotel sa modernim sadrzajima, spa centrom i elegantnim sobama u srcu Tuzle.',
      de: 'Gehobenes Hotel mit moderner Ausstattung, Spa-Center und eleganten Zimmern im Herzen von Tuzla.',
    },
    rating: 8.4,
    user_ratings_total: 620,
    address: 'Aleja Alije Izetbegovica 3, 75000 Tuzla',
    phone: '+387 35 365 500',
    latitude: 44.533980,
    longitude: 18.687263,
    website: 'https://mellainhotel.ba',
    image: '/assets/Gallery/Accommodation/mellain.webp',
    priceRange: '120–200 KM',
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking', 'AC'],
  },
  {
    name: 'Hotel Salis',
    description: {
      en: 'Modern wellness hotel steps from Pannonian Lakes, featuring thermal spa treatments and panoramic views.',
      bs: 'Moderni wellness hotel uz Panonska jezera, sa termalnim spa tretmanima i panoramskim pogledom.',
      de: 'Modernes Wellness-Hotel unweit der Pannonischen Seen, mit Thermal-Spa und Panoramablick.',
    },
    rating: 8.7,
    user_ratings_total: 480,
    address: 'Soli 4, 75000 Tuzla',
    phone: '+387 35 560 000',
    latitude: 44.533010,
    longitude: 18.644814,
    website: 'https://hotelsalis.ba',
    image: '/assets/Gallery/Accommodation/salis.webp',
    priceRange: '130–220 KM',
    amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant', 'Parking'],
  },
  {
    name: 'Hotel Vertigos',
    description: {
      en: 'Boutique hotel in central Tuzla with stylish interiors, rooftop terrace, and city views.',
      bs: 'Butik hotel u centru Tuzle sa stilski uredenim interijerom, krovnom terasom i pogledom na grad.',
      de: 'Boutique-Hotel im Zentrum von Tuzla mit stilvollem Interieur, Dachterrasse und Stadtblick.',
    },
    rating: 8.5,
    user_ratings_total: 390,
    address: 'Kulina bana 2, 75000 Tuzla',
    phone: '+387 35 258 258',
    latitude: 44.540506,
    longitude: 18.673874,
    website: 'https://hotelvertigos.com',
    image: '/assets/Gallery/Accommodation/Vertigos.webp',
    priceRange: '100–170 KM',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Terrace', 'AC'],
  },
  {
    name: 'Grand Hotel Tuzla',
    description: {
      en: 'Iconic city hotel with congress hall, nightclub, and gardens. Walking distance to Pannonian Lakes.',
      bs: 'Ikonični gradski hotel sa kongresnom salom, noćnim klubom i vrtovima. Blizu Panonskih jezera.',
      de: 'Ikonisches Stadthotel mit Kongresshalle, Nachtclub und Gärten. Fußweg zu den Pannonischen Seen.',
    },
    rating: 7.6,
    user_ratings_total: 710,
    address: 'ZAVNOBIH-a 13, 75000 Tuzla',
    phone: '+387 35 366 166',
    latitude: 44.531469,
    longitude: 18.688330,
    website: 'https://grandhotel.ba',
    image: '/assets/Gallery/Accommodation/grand hotel.webp',
    priceRange: '80–150 KM',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Nightclub', 'Congress Hall'],
  },
  {
    name: 'Hotel Tehnograd',
    description: {
      en: 'Modern hotel located in the business zone, offering comfortable rooms and conference facilities.',
      bs: 'Moderni hotel smješten u poslovnoj zoni, nudi udobne sobe i konferencijske sale.',
      de: 'Modernes Hotel in der Business-Zone mit komfortablen Zimmern und Konferenzeinrichtungen.',
    },
    rating: 8.2,
    user_ratings_total: 245,
    address: 'Zarka Vukovica bb (Goste Lazarevica bb), 75000 Tuzla',
    phone: '+387 35 300 300',
    latitude: 44.530075,
    longitude: 18.714120,
    website: 'https://hoteltehnograd.com',
    image: '/assets/Gallery/Accommodation/tehno.webp',
    priceRange: '80–130 KM',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Conference', 'AC'],
  },
  {
    name: 'Hotel Soni Lux',
    description: {
      en: 'Cozy hotel just 200m from Pannonian Lakes with warm hospitality and excellent breakfast.',
      bs: 'Udoban hotel 200m od Panonskih jezera sa toplim gostoprimstvom i odličnim doručkom.',
      de: 'Gemütliches Hotel nur 200m von den Pannonischen Seen mit warmem Empfang und ausgezeichnetem Frühstück.',
    },
    rating: 9.1,
    user_ratings_total: 260,
    address: 'Kulina bana 8, 75000 Tuzla',
    phone: '+387 35 249 111',
    latitude: 44.537665,
    longitude: 18.681706,
    image: '/assets/Gallery/Accommodation/Soni.webp',
    priceRange: '70–120 KM',
    amenities: ['WiFi', 'Breakfast', 'Parking', 'AC'],
  },
  {
    name: 'Heartland City Hotel',
    description: {
      en: 'Top-rated boutique hotel in the heart of Tuzla, steps from Freedom Square and the lakes.',
      bs: 'Najbolje ocijenjeni butik hotel u srcu Tuzle, korak od Trga slobode i jezera.',
      de: 'Bestbewertetes Boutique-Hotel im Herzen von Tuzla, wenige Schritte vom Freiheitsplatz und den Seen.',
    },
    rating: 9.4,
    user_ratings_total: 340,
    address: 'Kazanmahala 10, 75000 Tuzla',
    phone: '',
    latitude: 44.536228,
    longitude: 18.678135,
    website: 'https://heartland.ba',
    image: '/assets/Gallery/Accommodation/heartland.webp',
    priceRange: '140–250 KM',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'AC', 'City Center'],
  },
  {
    name: 'Hotel Royal',
    description: {
      en: 'Elegant motel located near the main bus station, offering a high-quality restaurant and comfortable stay.',
      bs: 'Elegantni motel smješten u blizini glavne autobuske stanice, nudi vrhunski restoran i udoban boravak.',
      de: 'Elegantes Motel in der Nähe des Busbahnhofs mit einem erstklassigen Restaurant und komfortablem Aufenthalt.',
    },
    rating: 8.2,
    user_ratings_total: 156,
    address: 'Bosne Srebrene 105/A, 75000 Tuzla',
    phone: '+387 35 277 111',
    latitude: 44.5332,
    longitude: 18.6572,
    website: 'https://www.royalmotel.ba/',
    image: '/assets/Gallery/Accommodation/royal.webp',
    priceRange: '70–130 KM',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'AC'],
  },
  {
    name: 'Hotel Minero',
    description: {
      en: 'Quiet hotel with restaurant and free parking, ideal for business travelers and families.',
      bs: 'Miran hotel sa restoranom i besplatnim parkingom, idealan za poslovne putnike i porodice.',
      de: 'Ruhiges Hotel mit Restaurant und kostenlosem Parkplatz, ideal für Geschäftsreisende und Familien.',
    },
    rating: 9.2,
    user_ratings_total: 180,
    address: 'Mitra Trifunovica Uce 9, 75000 Tuzla',
    phone: '+387 35 281 297',
    latitude: 44.531739,
    longitude: 18.654049,
    website: 'https://hotelminero.ba',
    image: '/assets/Gallery/Accommodation/Minero.webp',
    priceRange: '70–110 KM',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Bar', 'AC'],
  },
  {
    name: 'Pansion Centar',
    description: {
      en: 'Highest-rated guesthouse in Tuzla. Central, clean, with extraordinary table-served breakfast.',
      bs: 'Najbolje ocijenjen pansion u Tuzli. Centralan, čist, sa izvanrednim doručkom koji se služi za stolom.',
      de: 'Bestbewertete Pension in Tuzla. Zentral, sauber, mit außergewöhnlichem Tischfrühstück.',
    },
    rating: 9.5,
    user_ratings_total: 420,
    address: 'Trg Stara Trznica 8, Soni trg, 75000 Tuzla',
    phone: '',
    latitude: 44.537698,
    longitude: 18.676053,
    image: '/assets/Gallery/Accommodation/pansion.webp',
    extraImage: '/assets/Gallery/Accommodation/accommodationsQR.webp',
    extraLink: 'https://www.ba-hotel.com/en/tuzla-hotels-46026/hotels/',
    priceRange: '60–100 KM',
    amenities: ['WiFi', 'Breakfast', 'City Center', 'AC'],
  },
  {
    name: 'University Hotel Dorrah',
    description: {
      en: 'Modern hotel in western Tuzla offering free WiFi, restaurant, and complimentary parking.',
      bs: 'Moderni hotel u zapadnom dijelu Tuzle sa besplatnim WiFi-em, restoranom i parkingom.',
      de: 'Modernes Hotel im Westen von Tuzla mit kostenlosem WLAN, Restaurant und Gratis-Parkplatz.',
    },
    rating: 9.1,
    user_ratings_total: 210,
    address: 'Mitra Trifunovica Uce bb, 75000 Tuzla',
    phone: '',
    latitude: 44.531350,
    longitude: 18.652422,
    image: '/assets/Gallery/Accommodation/Dorrah.webp',
    priceRange: '80–130 KM',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'AC', 'Conference'],
  },
];
