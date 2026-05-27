import React, { useMemo, useState } from 'react';
import { Language } from '../types';
import { useImage } from '../hooks/ImageContext';
import { ZoomIn, CalendarPlus, Check } from 'lucide-react';
import { addToItinerary } from '../utils/itineraryUtils';

interface CityGuideProps {
  lang: Language;
}

const CityGuide: React.FC<CityGuideProps> = ({ lang }) => {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Mapping for Bosnian images
  const bsTitles: Record<number, string> = {
    1: "Tuzla Center",
    2: "Panonnic Lakes",
    3: "Tour Train",
    4: "City Park and King Tvrtko",
    5: "Salt Square",
    6: "Park Salt Spa",
    7: "Ilincica hill",
    8: "Sloboda caffe",
    9: "Books House",
    10: "Photo sites",
  };

  // Mapping for English/Other images
  const enTitles: Record<number, string> = {
    0: "Tuzla Center",
    1: "Panonnic lakes",
    2: "Tour Train",
    3: "City Park and King Tvrtko",
    4: "Salt Square",
    5: "Park Salt Spa",
    6: "Ilincica hill",
    7: "Sloboda caffe",
    8: "Books House",
    9: "Photo sites",
  };

  const images = useMemo(() => {
    if (lang === 'bs') {
      return Array.from({ length: 15 }, (_, i) => ({
        src: `/assets/Gallery/City Guide/GradTuzla-${i + 1}.webp`,
        name: bsTitles[i + 1] || `Tuzla Site ${i + 1}`
      }));
    } else {
      // First image is 0001, then starts at 0004 as requested
      const result = [
        { src: '/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-0001.webp', name: enTitles[0] }
      ];
      for (let i = 0; i < 14; i++) {
        result.push({
          src: `/assets/Gallery/City Guide/TUZLA-CITY-GUIDEen_page-${String(i + 4).padStart(4, '0')}.webp`,
          name: enTitles[i + 1] || `Tuzla Site ${i + 2}`
        });
      }
      return result;
    }
  }, [lang]);

  const pannonicaSrc = lang === 'bs' ? '/assets/PannonicaBA.webp'
    : lang === 'de' ? '/assets/PannonicaDE.webp'
      : lang === 'tr' ? '/assets/PannonicaTR.webp'
        : '/assets/Pannonica.webp';

  const emergencySrc = '/assets/Gallery/QuestQRLocations/tour-emergency info.webp';

  // Combine for gallery
  const allImageSrcs = useMemo(() => [
    ...images.map(img => img.src),
    pannonicaSrc,
    emergencySrc
  ], [images, pannonicaSrc, emergencySrc]);

  const { openGallery } = useImage();

  const handleImageTap = (index: number) => {
    openGallery(allImageSrcs, index);
  };

  const handleAddToPlan = async (name: string) => {
    const added = await addToItinerary(name, "Tuzla City Guide Site", 'Attraction');
    if (added) {
      setAddedIds(prev => new Set(prev).add(name));
      // Optional: Visual feedback or toast could go here
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4 max-w-4xl mx-auto overflow-y-auto pb-32">
      <h1 className="text-3xl sm:text-5xl font-black text-blue-900 mb-6 text-center drop-shadow-sm uppercase font-quicksand">
        {lang === 'bs' ? 'Gradski Vodič' : lang === 'de' ? 'Stadtführer' : lang === 'tr' ? 'Şehir Rehberi' : 'City Guide'}
      </h1>

      <div className="w-full flex flex-col gap-10">
        {images.map((img, index) => (
          <div key={index} className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.25)] bg-blue-50/30 group">
            <div
              className="cursor-pointer"
              onClick={() => handleImageTap(index)}
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Plan Button Overlay - Bottom Left */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToPlan(img.name);
                }}
                disabled={addedIds.has(img.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg backdrop-blur-md ${addedIds.has(img.name)
                    ? 'bg-green-500/90 text-white border border-green-400 cursor-default'
                    : 'bg-yellow-400/90 text-blue-900 border border-yellow-300 hover:bg-yellow-500 active:scale-95'
                  }`}
              >
                {addedIds.has(img.name) ? (
                  <><Check size={16} /> Added</>
                ) : (
                  <><CalendarPlus size={16} /> Plan</>
                )}
              </button>
            </div>

            {/* Zoom Icon Overlay - Bottom Right */}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white/90 p-2.5 rounded-2xl pointer-events-none">
              <ZoomIn size={20} />
            </div>
          </div>
        ))}
      </div>
      {/* Emergency Bottom */}
      <div className="w-full mt-12 mb-8">
        <div
          className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-blue-400/40 opacity-90 transition-opacity hover:opacity-100 cursor-pointer"
          onClick={() => handleImageTap(images.length + 1)}
        >
          <img src={emergencySrc} alt="Emergency Info" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default CityGuide;
