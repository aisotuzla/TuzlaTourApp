import React, { useState, useRef, useEffect } from 'react';
import { AppTab, Language } from '../types';
import {
  ArrowRight,
  Play,
  Pause,
  ChevronRight,
  ArrowUp,
  QrCode,
  Home,
  X,
  Facebook,
  Linkedin,
  Share2,
  ArrowDown
} from 'lucide-react';
import { useImage } from '../hooks/ImageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAppFeatures } from '../utils/platform';
import { useNetwork } from '../hooks/useNetwork';

interface LandingPageProps {
  lang: Language;
  onNavigate?: (tab: AppTab, options?: { openScanner?: boolean }) => void;
}

const copy = {
  en: {
    heroScroll: 'Scroll to explore Tuzla',
    cardsTitle: 'Your Journey Starts Here',
    linksTitle: 'Quick Links',
    albumTitle: 'Photo Gallery',
    explore: 'Explore',
  },
  bs: {
    heroScroll: 'Istražite Tuzlu',
    cardsTitle: 'Tvoje putovanje počinje ovdje',
    linksTitle: 'Brzi linkovi i partneri',
    albumTitle: 'Foto Galerija',
    explore: 'Istraži',
  },
  de: {
    heroScroll: 'Entdecke Tuzla',
    cardsTitle: 'Deine Reise beginnt hier',
    linksTitle: 'Schnellzugriffe und Partner',
    albumTitle: 'Fotoalbum',
    explore: 'Entdecken',
  },
  tr: {
    heroScroll: 'Tuzla\'yi Keşfet',
    cardsTitle: 'Yolculuğun Burada Başliyor',
    linksTitle: 'Hizli Linkler ve Partnerler',
    albumTitle: 'Fotoğraf Albümü',
    explore: 'Keşfet',
  },
} as const;

const navCards = [
  { id: AppTab.CITY_GUIDE, title: { en: 'City Guide', bs: 'Gradski Vodič' }, image: '/assets/Gallery/City Guide/GradTuzla-1.webp', color: 'blue' },
  { id: AppTab.FOOD, title: { en: 'Food', bs: 'Hrana' }, image: '/assets/Gallery/Food/foodprime.webp', color: 'orange' },
  { id: AppTab.ACCOMMODATION, title: { en: 'Accommodation', bs: 'Smještaj' }, image: '/assets/Gallery/Accommodation/mellain.webp', color: 'indigo' },
  { id: AppTab.MAP, title: { en: 'Map', bs: 'Mapa' }, image: '/assets/MapaBosnia.webp', color: 'blue' },
];

const externalLinks = [
  { name: 'TZTZ', url: 'https://tztz.ba', logo: '/assets/Gallery/QuestQRLocations/tztzlogo.webp' },
  { name: 'Grad Tuzla', url: 'https://grad.tuzla.ba', logo: '/assets/Gallery/QuestQRLocations/Zastava_tuzle.webp' },
  { name: 'WizzAir', url: 'https://wizzair.com', logo: '/assets/Gallery/QuestQRLocations/wizzurl.webp' },
  { name: 'Ilincica', url: 'https://ilincica.ba', logo: '/assets/Gallery/QuestQRLocations/ilincicaba.webp' },
];

const previewImages = Array.from({ length: 25 }, (_, i) => `/assets/Gallery/Photos/tuzla${i + 1}.webp`)
  .filter(p => p !== '/assets/Gallery/Photos/tuzla2.webp');

const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const t = (copy as any)[lang] || copy.en;
  const { openGallery } = useImage();
  const { platform } = getAppFeatures();
  const [heroLoopCount, setHeroLoopCount] = useState(0);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const cardsSectionRef = useRef<HTMLElement>(null);

  const isOnline = useNetwork();

  // 40-second automatic scroll
  useEffect(() => {
    if (isHeroReady && isHeroPlaying && isOnline && !hasVideoError) {
      const timer = setTimeout(() => {
        cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 40000);
      return () => clearTimeout(timer);
    }
  }, [isHeroReady, isHeroPlaying, isOnline, hasVideoError]);

  const toggleHeroVideo = () => {
    if (heroVideoRef.current) {
      if (isHeroPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
        setHeroLoopCount(0); // Reset count if manual play
      }
      setIsHeroPlaying(!isHeroPlaying);
    }
  };

  const handleHeroVideoEnd = () => {
    setIsHeroPlaying(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tuzla Virtual Tour Guide',
          text: lang === 'bs' ? 'Istraži Tuzlu kroz ovu interaktivnu aplikaciju!' : 'Check out this interactive map and guide to Tuzla!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === 'bs' ? 'Link kopiran!' : 'Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden bg-white">
        {!isHeroReady && (
          <div className="absolute inset-0 z-10 bg-white flex items-center justify-center">
            <div className="relative z-20 flex flex-col items-center">
              <motion.img
                src="/assets/Gallery/QuestQRLocations/IconTZ.webp"
                className="w-24 h-24 object-contain mb-8 opacity-20"
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {isOnline && !hasVideoError ? (
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/bckgrd.webp"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isHeroReady ? 'opacity-100' : 'opacity-0'}`}
            src={platform === 'web' ? "/assets/Gallery/Photos/HDweb_compressed.mp4" : platform === 'android' ? "/assets/Gallery/Photos/tz_compressed.mp4" : "/assets/Gallery/Photos/HDweb_compressed.mp4"}
            onLoadedData={() => setIsHeroReady(true)}
            onCanPlay={() => setIsHeroReady(true)}
            onError={() => {
              console.error('Hero video failed to load');
              setHasVideoError(true);
              setIsHeroReady(true);
            }}
            onEnded={handleHeroVideoEnd}
          />
        ) : (
          <img
            src="/assets/bckgrd.webp"
            alt="Tuzla Offline"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500`}
            onLoad={() => setIsHeroReady(true)}
            onError={() => setIsHeroReady(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/50" />

        {/* Play Button Overlay for Hero */}
        <AnimatePresence>
          {!isHeroPlaying && isOnline && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none text-white"
            >
              <button
                onClick={toggleHeroVideo}
                title="Play Video"
                aria-label="Play Video"
                className="pointer-events-auto w-24 h-24 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 active:scale-95"
              >
                <Play className="w-10 h-10 fill-current ml-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute top-[75%] -translate-y-1/2 left-0 right-0 flex flex-col items-center justify-center text-white gap-4 pointer-events-none z-10">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm font-black uppercase tracking-[0.3em] drop-shadow-lg text-white/90">
              {t.heroScroll}
            </span>
            <ArrowDown className="w-6 h-6 text-white/90 mt-2" />
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        {/* 2. NAVIGATION CARDS */}
        <section ref={cardsSectionRef} id="explore-sections">
          <div className="mb-10">
            <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
              {t.cardsTitle}
            </h2>
            <div className="w-20 h-2 bg-blue-600 rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {navCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onNavigate?.(card.id)}
                className="group relative h-[19.2rem] w-full rounded-[2.5rem] overflow-hidden border-2 border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-blue-400"
              >
                <img src={card.image} alt={card.id} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 text-left">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                    {(card.title as any)[lang] || card.title.en}
                  </h3>
                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <span className="text-sm font-bold uppercase tracking-widest">{t.explore}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 3. EXTERNAL PARTNER LINKS */}
        <section className="py-16">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
              {t.linksTitle}
            </h2>
            <div className="w-24 h-2 bg-blue-600 rounded-full mt-2 mx-auto md:mx-0" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 active:scale-95"
              >
                <div className="h-16 w-full flex items-center justify-center mb-4">
                  <img src={link.logo} alt={link.name} className="h-full w-auto object-contain transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900/60 group-hover:text-blue-600 transition-colors">{link.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* 4. PHOTO ALBUM */}
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

          <div className="mt-12 text-center">
            <p className="text-xl font-black text-blue-900/80 italic font-quicksand leading-relaxed max-w-2xl mx-auto px-4">
              {lang === 'bs' || lang === 'en' || lang === 'de' || lang === 'tr'
                ? 'Posjetite Tuzlu' : 'Visit Tuzla'}
            </p>
            <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-4 opacity-50" />
          </div>
        </section>

        {/* 4.5. SOCIAL & COMMUNITY */}
        <section className="pt-12 pb-6">
          <div className="mb-10 text-center flex flex-col items-center">
            <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
              {lang === 'bs' ? 'Zajednica & Mreže' : 'Community & Social'}
            </h2>
            <div className="w-20 h-2 bg-blue-600 rounded-full mt-2" />
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center flex-wrap gap-4 sm:gap-6">
              <a href="https://x.com/icptuzla" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors relative group">
                <img src="/assets/x.svg" alt="X" className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Twitter (X)</span>
              </a>
              <a href="https://www.facebook.com/AmirICPTuzla" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#4267B2] hover:bg-[#4267B2]/10 transition-colors relative group">
                <Facebook className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Facebook</span>
              </a>
              <a href="https://www.linkedin.com/in/icptuzla-amir-mulaosmanovic-ab356a34b/" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 transition-colors relative group">
                <Linkedin className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">LinkedIn</span>
              </a>
              <button onClick={handleShare} className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors relative group cursor-pointer">
                <Share2 className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Share App</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm font-bold uppercase tracking-widest">
              <a
                href="#"
                className="flex items-center gap-2 group hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1 text-slate-400"
              >
                <img
                  src="/assets/Gallery/QuestQRLocations/LogoICP3D.webp"
                  alt="ICP Logo"
                  className="w-6 h-6 object-contain pointer-events-none group-hover:scale-110 transition-transform"
                />
                <span>ICP Tuzla</span>
              </a>
            </div>
          </div>
        </section>

        {/* 5. EXPLORE MORE ENDING */}
        <section className="py-24 border-t border-slate-100 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-block p-4 bg-blue-50 rounded-3xl mb-4">
              <Home className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tight font-quicksand">
              {lang === 'bs' ? 'Istražite više' : 'Explore More'}
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed font-medium">
              {lang === 'bs'
                ? 'Vaše putovanje se ne završava ovdje. Tuzla nudi beskrajne priče i skrivene dragulje.'
                : 'Your journey doesn\'t end here. Tuzla offers endless stories and hidden gems waiting to be discovered.'}
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-8 px-12 py-5 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center gap-3 mx-auto font-quicksand"
            >
              <ArrowUp className="w-5 h-5" />
              {lang === 'bs' ? 'Povratak na vrh' : 'Back to Home'}
            </button>
          </motion.div>
        </section>
      </div>


    </div>
  );
};

export default LandingPage;
