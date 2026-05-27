import React from 'react';
import { Language } from '../types';

interface LandingPhotoAlbumProps {
  openGallery: (images: string[], index: number) => void;
  previewImages: string[];
  t: any;
}

const LandingPhotoAlbum: React.FC<LandingPhotoAlbumProps> = ({ openGallery, previewImages, t }) => {
  return (
    <section>
      <div className="mb-10">
        <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
          {t.albumTitle}
        </h2>
        <div className="w-20 h-2 bg-blue-600 rounded-full mt-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {previewImages.slice(0, 12).map((src, idx) => (
          <button
            key={src}
            onClick={() => openGallery(previewImages, idx)}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:scale-[1.02] transition-all duration-500 active:scale-95 group"
          >
            <img src={src} alt="Tuzla Photo" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/10 transition-colors" />
          </button>
        ))}
      </div>
    </section>
  );
};

export default LandingPhotoAlbum;
