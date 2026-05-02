import React from 'react';
import { Language } from '../types';
import { AppFeatures } from '../utils/platform';
import { useImage } from '../hooks/ImageContext';

interface GalleryProps {
  lang: Language;
  features: AppFeatures;
}

const Gallery: React.FC<GalleryProps> = () => {
  const { openGallery } = useImage();
  const cityPhotos = Array.from({ length: 28 }, (_, i) => `/assets/Gallery/Photos/tuzla${i + 1}.webp`)
    .filter(p => p !== '/assets/Gallery/Photos/tuzla2.webp'); // Remove graphic no.2

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] overflow-x-hidden pb-32 pt-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cityPhotos.map((photo, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-white cursor-pointer border border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] hover:border-blue-400 transition-all duration-500 group-hover:scale-[1.02]"
              onClick={() => openGallery(cityPhotos, index)}
            >
              <img
                src={photo}
                alt={`Tuzla ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
