import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, LocationData } from '../types';
import { TUZLA_DINING_DATA } from '../constants';
import {
  ExternalLink,
  UtensilsCrossed,
  Navigation,
  MapPin,
  Bike,
  Utensils,
  Plus,
  Check
} from 'lucide-react';
import { addToItinerary } from '../utils/itineraryUtils';
import { useImage } from '../hooks/ImageContext';

/* ─── All Venues Sub-component ─── */
interface AllVenuesSectionProps {
  lang: Language;
  onNavigateToTarget?: (target: { name: string; lat: number; lon: number }) => void;
}

const AllVenuesSection: React.FC<AllVenuesSectionProps> = ({ lang, onNavigateToTarget }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Dining'>('All');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const filtered = filter === 'All' ? TUZLA_DINING_DATA : TUZLA_DINING_DATA.filter(v => v.type === filter);

  const handleAddToItinerary = async (venue: LocationData) => {
    const type = venue.type === 'Dining' ? 'Restaurant' : 'Attraction';
    const added = await addToItinerary(venue.name, venue.address, type);
    if (added) {
      setAddedIds(prev => new Set(prev).add(venue.name));
    }
  };

  const handleNavigateToVenue = (venue: LocationData) => {
    if (onNavigateToTarget) {
      onNavigateToTarget({
        name: venue.name,
        lat: venue.latitude,
        lon: venue.longitude,
      });
    } else {
      navigate('/map');
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-7">
      <div className="space-y-1 border-b border-blue-100 pb-3 sm:pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-blue-950 uppercase flex items-center gap-2.5">
          <Utensils className="w-6 h-6 text-blue-600" />
          {lang === 'en' ? 'Food Places' : lang === 'bs' ? 'Hrana i piće' : lang === 'de' ? 'Essensplätze' : 'Yemek Mekanları'}
        </h2>
        <p className="text-blue-600/80 font-bold uppercase text-[10px] sm:text-xs tracking-wider">
          {lang === 'en' ? 'Best dining in one place' : lang === 'de' ? 'Restaurants an einem Ort' : lang === 'tr' ? 'En iyi restoranlar tek yerde' : 'Restorani na jednom mjestu'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['All', 'Dining'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider border transition-all ${filter === f
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}
          >
            {f === 'All' ? (lang === 'en' ? 'All' : lang === 'de' ? 'Alle' : 'Sve')
              : (lang === 'en' ? 'Dining' : lang === 'de' ? 'Restaurant' : 'Restorani')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {filtered.map((venue, idx) => (
          <div
            key={idx}
            className="group bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              {venue.image && (
                <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden mb-3.5 bg-slate-50 flex items-center justify-center p-3 border border-slate-100">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-black text-blue-950 leading-snug group-hover:text-blue-600 transition-colors">
                    {venue.name}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                    <span className="text-xs font-bold leading-tight text-slate-700 truncate">{venue.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold">{venue.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => handleNavigateToVenue(venue)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Navigate on Map' : lang === 'bs' ? 'Navigacija na mapi' : lang === 'de' ? 'Auf Karte zeigen' : 'Haritada Gör'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {venue.website ? (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 w-full py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    {lang === 'en' ? 'Visit' : lang === 'de' ? 'Web' : 'Web'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => handleAddToItinerary(venue)}
                  disabled={addedIds.has(venue.name)}
                  className={`flex items-center justify-center gap-1 w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${venue.website ? '' : 'col-span-2'
                    } ${addedIds.has(venue.name)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-xs'
                    }`}
                >
                  {addedIds.has(venue.name) ? (
                    <><Check className="w-3.5 h-3.5" /> {lang === 'en' ? 'In Plan' : 'U planu'}</>
                  ) : (
                    <><Plus className="w-3.5 h-3.5" /> {lang === 'en' ? 'Plan' : 'U plan'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Food Delivery Special Card */}
        <a
          href="https://korpa.ba/kategorije?kat=&min="
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="space-y-3 flex-grow flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-black text-blue-950 leading-snug group-hover:text-blue-600 transition-colors uppercase">
                {lang === 'bs' ? 'Dostava Hrane' : lang === 'de' ? 'Essenslieferung' : lang === 'tr' ? 'Yemek Teslimatı' : 'Food Delivery'}
              </h3>
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg shrink-0 ml-2 border border-blue-100">
                <Bike className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>

            <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
              <img
                src="/assets/Gallery/Food/korpa.webp"
                alt="korpa.ba"
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1.5 text-blue-600">
                <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold leading-tight">korpa.ba</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 w-full py-2.5 mt-auto rounded-xl font-black text-xs uppercase tracking-wider transition-all bg-yellow-400 text-blue-950 hover:bg-yellow-300 active:scale-95 shadow-xs border border-yellow-500/30">
              {lang === 'en' ? 'Order' : lang === 'bs' ? 'Naruči' : lang === 'de' ? 'Bestellen' : 'Sipariş'}
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export interface FoodProps {
  lang: Language;
  onNavigateToTarget?: (target: { name: string; lat: number; lon: number }) => void;
}

const Food: React.FC<FoodProps> = ({ lang, onNavigateToTarget }) => {
  const { openGallery } = useImage();

  const restaurantImages = [
    { src: '/assets/Gallery/Food/RESTAURANTS1.webp', alt: 'Restaurants List 1' },
    { src: '/assets/Gallery/Food/RESTAURANTS2.webp', alt: 'Restaurants List 2' },
    { src: '/assets/Gallery/Food/RESTAURANTS3.webp', alt: 'Restaurants List 3' },
    { src: '/assets/Gallery/Food/RESTAURANTS4.webp', alt: 'Restaurants List 4' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-28 space-y-8 sm:space-y-12">
      <header className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-black uppercase tracking-wider text-blue-700 shadow-xs">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          {lang === 'en' ? 'Food & Drink' : lang === 'de' ? 'Essen & Trinken' : lang === 'tr' ? 'Yemek & İçecek' : 'Hrana i piće'}
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-blue-950 uppercase tracking-tight">
          {lang === 'en' ? 'Gastronomy' : lang === 'de' ? 'Gastronomie' : lang === 'tr' ? 'Gastronomi' : 'Gastronomija'}
        </h1>
        <p className="text-blue-600 font-medium text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {lang === 'en'
            ? 'Discover best restaurants and local flavors in Tuzla.'
            : lang === 'de'
              ? 'Entdecken Sie die besten Restaurants und lokalen Spezialitäten in Tuzla.'
              : lang === 'tr'
                ? 'Tuzla\'nın en iyi restoranlarını ve yerel lezzetlerini keşfedin.'
                : 'Otkrijte najbolje restorane i lokalne okuse u Tuzli.'}
        </p>
      </header>

      <section className="w-full">
        <AllVenuesSection lang={lang} onNavigateToTarget={onNavigateToTarget} />
      </section>

      {/* 4 Image Scrollable Row with natural aspect ratio & full sharpness */}
      <div className="w-full mt-8 pt-6 border-t border-blue-100">
        <div className="mb-3.5">
          <h3 className="text-sm sm:text-base font-black text-blue-950 uppercase tracking-tight">
            {lang === 'bs' ? 'Pregled restorana i menija' : 'Restaurant & Menu Directory'}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {lang === 'bs' ? 'Dodirnite sliku za prikaz u punoj rezoluciji' : 'Tap image to view in full resolution'}
          </p>
        </div>
        <div className="w-full flex overflow-x-auto gap-3 sm:gap-4 snap-x snap-mandatory pb-3">
          {restaurantImages.map((img, index) => (
            <div
              key={index}
              onClick={() => openGallery(restaurantImages.map(r => r.src), index)}
              className="relative w-[260px] sm:w-[320px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-md border-2 border-slate-200 bg-slate-900 cursor-pointer snap-center group hover:border-blue-400 transition-all"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-102"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Food;
