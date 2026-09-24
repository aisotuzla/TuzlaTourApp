import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { ZoomIn } from 'lucide-react';
import type { FC } from 'react';

import { AppTab, Language } from '../types';
import {
  ArrowRight,
  Play,
  ChevronRight,
  ArrowUp,
  QrCode,
  Home,
  X,
  Facebook,
  Linkedin,
  Share2,
  ArrowDown,
  RotateCcw,
  Loader2,
  Landmark,
  Map as MapIcon,
  Smartphone
} from 'lucide-react';
import { useImage } from '../hooks/ImageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAppFeatures } from '../utils/platform';

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
    albumText: 'No photo can show the full charm and beauty of this city, so come and visit us.',
    videoTitle: 'Video',
    communityTitle: 'Community & Social',
    exploreMoreTitle: 'Explore More',
    exploreMoreText: "Your journey doesn't end here. Tuzla offers endless stories and hidden gems waiting to be discovered.",
    backToTop: 'Back to Home',
    shareApp: 'Share App',
    shareText: 'Check out this interactive map and guide to Tuzla!',
    linkCopied: 'Link copied to clipboard!',
    explore: 'Explore',
    gipsLabel: 'Track your City Bus Line Location',
    pannonicaTitle: 'Pannonica Special',
    pannonicaBack: 'Back',
    pannonicaVisitSite: 'Visit panonika.ba',
    tapToOpen: 'Tap again to open',
    questModalTitle: 'Search / Quest',
    questModalSubtitle: 'Interactive exploration map with rewards, hidden history, and discounts across Tuzla.',
    questModalStart: 'Start Quest',
    questModalViewMap: 'View on Map',
    questModalClose: 'Close',
    questModalTarget1: 'Pannonian Lakes & Salt Waterfalls',
    questModalTarget2: 'Freedom Square & Historic Center',
    questModalTarget3: 'Salt Square & Neolithic Stilt Village',
  },
  bs: {
    heroScroll: 'Istražite Tuzlu',
    cardsTitle: 'Tvoje putovanje počinje ovdje',
    linksTitle: 'Brzi linkovi i partneri',
    albumTitle: 'Foto Galerija',
    videoTitle: 'Video',
    communityTitle: 'Zajednica i mreže',
    exploreMoreTitle: 'Istražite više',
    exploreMoreText: 'Vaše putovanje se ne završava ovdje. Tuzla nudi beskrajne priče i skrivene dragulje.',
    backToTop: 'Povratak na vrh',
    shareApp: 'Podijeli aplikaciju',
    shareText: 'Istraži Tuzlu kroz ovu interaktivnu aplikaciju!',
    linkCopied: 'Link kopiran!',
    explore: 'Istraži',
    gipsLabel: 'GIPS red vožnje i lokacija',
    pannonicaTitle: 'Panonika Info',
    pannonicaBack: 'Nazad',
    pannonicaVisitSite: 'Posjeti panonika.ba',
    tapToOpen: 'Dodirni ponovo za otvaranje',
  },
  de: {
    heroScroll: 'Entdecke Tuzla',
    cardsTitle: 'Deine Reise beginnt hier',
    linksTitle: 'Schnellzugriffe und Partner',
    albumTitle: 'Fotoalbum',
    albumText: 'Kein Foto kann den ganzen Charme und die Schönheit dieser Stadt zeigen. Kommen Sie und besuchen Sie uns.',
    videoTitle: 'Video',
    communityTitle: 'Community & Soziale Medien',
    exploreMoreTitle: 'Mehr Entdecken',
    exploreMoreText: 'Ihre Reise endet hier nicht. Tuzla bietet unzählige Geschichten und verborgene Orte, die darauf warten, entdeckt zu werden.',
    backToTop: 'Zurück nach oben',
    shareApp: 'App teilen',
    shareText: 'Entdecke Tuzla mit dieser interaktiven Karte und diesem Reiseführer!',
    linkCopied: 'Link wurde kopiert!',
    explore: 'Entdecken',
    gipsLabel: 'Stadtbus-Linie in Echtzeit verfolgen',
    pannonicaTitle: 'Pannonica Spezial',
    pannonicaBack: 'Zurück',
    pannonicaVisitSite: 'panonika.ba besuchen',
    tapToOpen: 'Erneut tippen zum Öffnen',
  },
  tr: {
    heroScroll: 'Tuzla\'yı Keşfet',
    cardsTitle: 'Yolculuğun Burada Başlıyor',
    linksTitle: 'Hızlı Bağlantılar ve Ortaklar',
    albumTitle: 'Fotoğraf Albümü',
    albumText: 'Hiçbir fotoğraf bu şehrin tüm cazibesini ve güzelliğini gösteremez; gelin ve bizi ziyaret edin.',
    videoTitle: 'Video',
    communityTitle: 'Topluluk ve Sosyal Medya',
    exploreMoreTitle: 'Daha Fazla Keşfet',
    exploreMoreText: 'Yolculuğunuz burada bitmiyor. Tuzla, keşfedilmeyi bekleyen sayısız hikaye ve gizli güzellik sunuyor.',
    backToTop: 'Başa dön',
    shareApp: 'Uygulamayı paylaş',
    shareText: 'Bu interaktif harita ve rehberle Tuzla’yı keşfet!',
    linkCopied: 'Bağlantı kopyalandı!',
    explore: 'Keşfet',
    gipsLabel: 'Şehir otobüs hattını canlı takip et',
    pannonicaTitle: 'Pannonica Özel',
    pannonicaBack: 'Geri',
    pannonicaVisitSite: 'panonika.ba ziyaret et',
    tapToOpen: 'Açmak için tekrar dokunun',
  },
} as const;

const heroMarkers = [
  {
    id: AppTab.CITY_GUIDE,
    title: { en: 'City Guide', bs: 'Gradski vodič', de: 'Stadtführer', tr: 'Şehir Rehberi' },
    x: 78.5,
    y: 27.2,
    labelPosition: 'left' as const,
    icon: Landmark,
    accentGlow: 'rgba(56, 189, 248, 0.9)',
    tagText: { en: 'Upper Lake', bs: 'Gornje jezero', de: 'Oberer See', tr: 'Üst Göl' }
  },
  {
    id: AppTab.MAP,
    title: { en: 'Map', bs: 'Mapa', de: 'Karte', tr: 'Harita' },
    x: 35.5,
    y: 48.2,
    labelPosition: 'right' as const,
    icon: MapIcon,
    accentGlow: 'rgba(96, 165, 250, 0.9)',
    tagText: { en: 'Middle Lake', bs: 'Srednje jezero', de: 'Mittlerer See', tr: 'Orta Göl' }
  },
  {
    id: AppTab.QUEST,
    title: { en: 'Quest', bs: 'Potraga', de: 'Quest', tr: 'Görev' },
    x: 77.0,
    y: 75.5,
    labelPosition: 'left' as const,
    icon: Smartphone,
    accentGlow: 'rgba(6, 182, 212, 0.9)',
    tagText: { en: 'Bottom Lake', bs: 'Donje jezero', de: 'Unterer See', tr: 'Alt Göl' }
  },
];


const navCards = [
  { id: AppTab.CITY_GUIDE, title: { en: 'City Guide', bs: 'Gradski vodič', de: 'Stadtführer', tr: 'Şehir Rehberi' }, image: '/assets/Gallery/City Guide/GradTuzla-1.webp', color: 'blue' },
  { id: AppTab.FOOD, title: { en: 'Food', bs: 'Hrana', de: 'Essen & Trinken', tr: 'Yemek & İçecek' }, image: '/assets/Gallery/Food/foodprime.webp', color: 'orange' },
  { id: AppTab.ACCOMMODATION, title: { en: 'Accommodation', bs: 'Smještaj', de: 'Unterkunft', tr: 'Konaklama' }, image: '/assets/Gallery/Accommodation/mellain.webp', color: 'indigo' },
  { id: AppTab.MAP, title: { en: 'Map', bs: 'Mapa', de: 'Karte', tr: 'Harita' }, image: '/assets/MapaBosnia.webp', color: 'blue' },
];

const externalLinks = [
  { name: 'TZTZ', url: 'https://tztz.ba', logo: '/assets/Gallery/QuestQRLocations/tztzlogo.webp' },
  { name: 'Grad Tuzla', url: 'https://grad.tuzla.ba', logo: '/assets/Gallery/QuestQRLocations/Zastava_tuzle.webp' },
  { name: 'WizzAir', url: 'https://wizzair.com', logo: '/assets/Gallery/QuestQRLocations/wizzurl.webp' },
  { name: 'Airbnb', url: 'https://www.airbnb.ba/tuzla-bosnia-and-herzegovina/stays', logo: '/assets/Gallery/QuestQRLocations/airbnbng.webp' },
];

const previewImages = Array.from({ length: 24 }, (_, i) => `/assets/Gallery/Photos/tuzla${i + 1}.webp`)
  .filter(p => p !== '/assets/Gallery/Photos/tuzla2.webp');

const pannonicaImageByLanguage: Record<Language, string> = {
  en: '/assets/PannonicaEN.webp',
  bs: '/assets/PannonicaBA.webp',
  de: '/assets/PannonicaDE.webp',
  tr: '/assets/PannonicaTR.webp',
};

const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const t = (copy as any)[lang] || copy.en;
  const pannonicaImage = pannonicaImageByLanguage[lang] || pannonicaImageByLanguage.en;
  const { openGallery } = useImage();
  const { platform } = getAppFeatures();
  const [heroLoopCount, setHeroLoopCount] = useState(0);
  const [isHeroPlaying, setIsHeroPlaying] = useState(false);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [isHeroMuted, setIsHeroMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const cardsSectionRef = useRef<HTMLElement>(null);

  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(AppTab.CITY_GUIDE);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const hasOpenedQuestModalRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isQuestModalOpen) {
          setIsQuestModalOpen(false);
        }
        if (activeMarkerId) {
          setActiveMarkerId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMarkerId, isQuestModalOpen]);

  // Scroll triggers for hero hotspots & Search / Quest modal
  useEffect(() => {
    let lastStep = -1;

    const getScrollTop = () => {
      const mainEl = document.querySelector('main');
      const mainScroll = mainEl ? mainEl.scrollTop : 0;
      const winScroll = window.scrollY || document.documentElement.scrollTop || 0;
      return Math.max(mainScroll, winScroll);
    };

    const handleScroll = () => {
      const st = getScrollTop();

      // Step 0: Initial Page Load / Top (st < 80px) -> City Guide (Gradski vodič)
      if (st < 80) {
        if (lastStep !== 0) {
          lastStep = 0;
          setActiveMarkerId(AppTab.CITY_GUIDE);
        }
      }
      // Step 1: Scroll Step 1 (Down) (80px <= st < 220px) -> Map (Mapa)
      else if (st >= 80 && st < 220) {
        if (lastStep !== 1) {
          lastStep = 1;
          setActiveMarkerId(AppTab.MAP);
        }
      }
      // Step 2: Scroll Step 2 (Down) (st >= 220px) -> Search / Quest (Potraga) popup modal
      else {
        if (lastStep !== 2) {
          lastStep = 2;
          setActiveMarkerId(AppTab.QUEST);
          if (!hasOpenedQuestModalRef.current) {
            hasOpenedQuestModalRef.current = true;
            setIsQuestModalOpen(true);
          }
        }
      }
    };

    // Evaluate scroll position on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  const cleanSrc = (src?: string) => {
    if (!src) return '';
    return src.replace(/^["']|["']$/g, '');
  };

  const isDev = import.meta.env.DEV;
  const defaultWebSrc = "/assets/Gallery/Photos/HDweb_compressed.mp4";

  const initialWebSrc = cleanSrc(isDev ? '' : import.meta.env.VITE_VERCEL_BLOB_HERO_WEB) || defaultWebSrc;
  const preferredSrc = initialWebSrc;

  const [videoSrc, setVideoSrc] = useState(preferredSrc);

  const toggleHeroVideo = () => {
    if (heroVideoRef.current) {
      if (isHeroPlaying) {
        heroVideoRef.current.pause();
        setIsHeroPlaying(false);
      } else {
        setIsBuffering(true);
        setHasVideoEnded(false);
        const playPromise = heroVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsHeroPlaying(true);
              setIsBuffering(false);
              setHeroLoopCount(0);
            })
            .catch((error) => {
              console.warn("Autoplay with audio was blocked or interrupted, trying muted playback:", error);
              if (heroVideoRef.current) {
                heroVideoRef.current.muted = true;
                setIsHeroMuted(true);
                heroVideoRef.current.play()
                  .then(() => {
                    setIsHeroPlaying(true);
                    setIsBuffering(false);
                  })
                  .catch((err) => {
                    console.error("Video playback failed completely:", err);
                    setIsHeroPlaying(false);
                    setIsBuffering(false);
                  });
              }
            });
        } else {
          setIsHeroPlaying(true);
          setIsBuffering(false);
        }
      }
    }
  };


  const handleHeroVideoEnd = () => {
    setIsHeroPlaying(false);
    setHasVideoEnded(true);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (heroVideoRef.current) {
      heroVideoRef.current.currentTime = 0;
      setHasVideoEnded(false);
      toggleHeroVideo();
    }
  };

  const handleVideoError = () => {
    const fallback = defaultWebSrc;
    if (videoSrc !== fallback) {
      console.warn(`Video failed to load from ${videoSrc}. Falling back to local asset: ${fallback}`);
      setVideoSrc(fallback);
      if (heroVideoRef.current) {
        heroVideoRef.current.load();
      }
    } else {
      console.error("Local fallback video also failed to load.");
      setIsBuffering(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tuzla Virtual Tour Guide',
          text: t.shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t.linkCopied);
    }
  };

  return (
    <div className="w-full bg-white">
      <style>{`
        @media (max-width: 440px) {
          .hero-section {
            padding: 0.5rem 0.25rem !important;
            height: auto !important;
            min-height: auto !important;
          }
          .hero-wrapper {
            width: 100% !important;
            height: auto !important;
            max-width: 440px !important;
            border-radius: 1.5rem !important;
            border: 2px solid rgba(96, 165, 250, 0.45) !important;
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.5) !important;
          }
          .hero-image-img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        }
        @media (min-width: 441px) {
          .hero-section {
            padding: 2rem !important;
            height: auto !important;
            min-height: auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .hero-wrapper {
            width: 880px !important;
            height: auto !important;
            max-width: 100% !important;
            border-radius: 2.5rem !important;
            border: 2px solid rgba(96, 165, 250, 0.45) !important;
            box-shadow: 0 0 35px rgba(59, 130, 246, 0.6) !important;
          }
          .hero-image-img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          .hero-section {
            padding: 2.5rem 2rem !important;
          }
          .hero-wrapper {
            width: 880px !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-section relative w-full flex flex-col items-center justify-center bg-white">
        {/* Rounded wrapper with glowing blue border and interactive markers */}
        <div
          className="hero-wrapper relative overflow-hidden bg-slate-950 flex select-none group/hero cursor-pointer"
          onClick={() => setActiveMarkerId(null)}
        >
          <img
            src="/assets/Gallery/heroo.webp"
            alt="Tuzla Pannonica Lakes"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="hero-image-img w-full h-auto block object-cover pointer-events-none"
            draggable={false}
          />

          {/* Interactive Marker Hotspots */}
          {heroMarkers.map((marker) => {
            const isLeft = marker.labelPosition === 'left';
            const labelText = (marker.title as any)[lang] || marker.title.en;
            const isOpen = activeMarkerId === marker.id;

            return (
              <div
                key={marker.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (marker.id === AppTab.QUEST) {
                      setActiveMarkerId(marker.id);
                      setIsQuestModalOpen(true);
                    } else if (isOpen) {
                      setActiveMarkerId(null);
                      onNavigate?.(marker.id);
                    } else {
                      setActiveMarkerId(marker.id);
                    }
                  }}
                  className="relative flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-full"
                  aria-label={`${labelText} - ${t.explore}`}
                  title={`${labelText} (${(marker.tagText as any)[lang] || marker.tagText.en})`}
                >
                  {/* Glowing hotspot indicator over the 3D pin in the artwork */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105">
                    <span className="absolute inset-0 rounded-full hero-hotspot-btn" />
                    <span className="hero-hotspot-ripple hero-hotspot-ripple-continuous pointer-events-none" />
                  </div>

                  {/* Interactive Label Pill - Revealed on 1st tap */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85, x: isLeft ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.85, x: isLeft ? 10 : -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'right-full mr-2 sm:mr-3.5' : 'left-full ml-2 sm:ml-3.5'
                          } pointer-events-auto z-30`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (marker.id === AppTab.QUEST) {
                            setIsQuestModalOpen(true);
                          } else {
                            setActiveMarkerId(null);
                            onNavigate?.(marker.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-950/90 hover:bg-blue-950/95 backdrop-blur-md border border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.55)] active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/25 border border-cyan-400/40 flex items-center justify-center shrink-0">
                            <marker.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider font-quicksand drop-shadow-sm leading-tight">
                              {labelText}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-cyan-300/90 font-medium">
                              {t.tapToOpen}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            );
          })}


        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
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


        {/* 2.5. Pannonica Special */}
        <div className="w-full mt-8 relative rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-blue-400/40 group">
          <div
            className="cursor-pointer"
            onClick={() => openGallery([pannonicaImage, ...previewImages], 0)}
          >
            <img
              src={pannonicaImage}
              alt={t.pannonicaTitle}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white/80 p-2.5 rounded-2xl pointer-events-none">
            <ZoomIn size={20} />
          </div>
        </div>

        <div className="w-full flex justify-center mt-4">
          <a
            href="https://panonika.ba"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-300"
          >
            <img
              src="/assets/panonikalogo.webp"
              alt="Pannonica Logo"
              className="w-[200px] h-[50px] object-contain"
            />
          </a>
        </div>


        {/* 3. EXTERNAL PARTNER LINKS */}
        <section className="py-10">
          <div className="mb-8 text-center md:text-left">
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
                className="group flex flex-col items-center justify-center p-4 rounded-3xl hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:scale-[1.02] transition-all duration-500 active:scale-95 bg-white/0 hover:bg-white/50"
              >
                <div className="h-16 md:h-20 w-full flex items-center justify-center">
                  <img src={link.logo} alt={link.name} className="h-full w-auto object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                </div>
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
            {previewImages.slice(0, 18).map((src, idx) => (
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

        {/* 4.5. SMARTPHONE VIDEO */}
        <section className="py-10 flex flex-col items-center">
          <div className="mb-10 text-center">
            <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
              {t.videoTitle}
            </h2>
            <div className="w-16 h-2 bg-blue-600 rounded-full mt-2 mx-auto" />
          </div>
          <div
            onClick={toggleHeroVideo}
            className="relative w-[340px] sm:w-[360px] h-[680px] sm:h-[720px] border-[14px] border-slate-900 rounded-[3rem] bg-black shadow-2xl overflow-hidden ring-4 ring-slate-800 cursor-pointer group select-none"
          >
            {/* Speaker notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-2xl w-32 mx-auto z-30 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Video element */}
            <video
              ref={heroVideoRef}
              playsInline
              className="absolute inset-0 h-full w-full object-cover z-0"
              src={videoSrc}
              onEnded={handleHeroVideoEnd}
              onError={handleVideoError}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => {
                setIsHeroReady(true);
                setIsBuffering(false);
              }}
              preload="metadata"
            />

            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="p-4 rounded-2xl bg-black/70 border border-white/10 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-[11px] font-black uppercase text-white tracking-widest">Loading...</span>
                </div>
              </div>
            )}

            {/* Cover image when paused or not started */}
            <AnimatePresence>
              {!isHeroPlaying && !hasVideoEnded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-end"
                >
                  <img
                    src="/assets/Gallery/QuestQRLocations/tuzhero.webp"
                    alt="Tuzla Video Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Play trigger button on bottom of video */}
                  <div className="relative z-20 mb-8 sm:mb-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHeroVideo();
                      }}
                      className="opacity-50 hover:opacity-80 transition-all flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-xl active:scale-95 cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-[#4169E1] text-[#4169E1] ml-0.5" />
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFD700]">
                        Play Video
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Replay Overlay */}
            <AnimatePresence>
              {hasVideoEnded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6"
                >
                  <button
                    onClick={handleReplay}
                    className="w-18 h-18 bg-gradient-to-tr from-amber-400 to-yellow-400 border-2 border-yellow-200 rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-110 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-8 h-8" />
                  </button>
                  <span className="text-sm font-black uppercase tracking-widest text-white">
                    Watch Again
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 4.55. GIPS BUS TRACKING */}
        <div className="w-full flex flex-col items-center mt-2 mb-6">
          <a
            href="https://www.gipstk.com/red-voznje/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 hover:scale-105 active:scale-95 transition-transform duration-300"
          >
            <div className="w-[180px] h-[90px] bg-white rounded-2xl shadow-lg border border-blue-100 flex items-center justify-center overflow-hidden group-hover:shadow-blue-200 group-hover:shadow-xl transition-shadow duration-300">
              <img
                src="/assets/Gallery/gipslogo.png"
                alt="GIPS Logo"
                className="w-full h-full object-contain p-3"
              />
            </div>
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wider text-center px-4">
              {t.gipsLabel}
            </span>
          </a>
        </div>

        {/* 4.6. SOCIAL & COMMUNITY */}
        <section className="pt-8 pb-4">
          <div className="mb-10 text-center flex flex-col items-center">
            <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
              {t.communityTitle}
            </h2>
            <div className="w-20 h-2 bg-blue-600 rounded-full mt-2" />
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center flex-wrap gap-4 sm:gap-6">
              <a href="https://x.com/AISO_tuzla" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors relative group">
                <img src="/assets/x.svg" alt="X" className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Twitter (X)</span>
              </a>
              <a href="https://bsky.app/profile/aisotuzla.bsky.social" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#0285FF] hover:bg-[#0285FF]/10 transition-colors relative group">
                <img src="/assets/bluesky.svg" alt="Bluesky" className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Bluesky</span>
              </a>
              <a href="https://facebook.com/profile.php?id=61589883383077" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#4267B2] hover:bg-[#4267B2]/10 transition-colors relative group">
                <Facebook className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Facebook</span>
              </a>
              <a href="https://www.linkedin.com/in/aiso-tuzla-ab356a34b/?isSelfProfile=true" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 transition-colors relative group">
                <Linkedin className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">LinkedIn</span>
              </a>
              <button onClick={handleShare} className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors relative group cursor-pointer">
                <Share2 className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{t.shareApp}</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm font-bold uppercase tracking-widest">
              <a
                href="https://aiso-tuzla.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1 text-slate-600"
              >
                <img
                  src="/assets/icons/aisologo.webp"
                  alt="AISO Logo"
                  className="w-6 h-6 object-contain pointer-events-none group-hover:scale-110 transition-transform"
                />
                <span>AISO Tuzla</span>
              </a>
            </div>
          </div>
        </section>

        {/* 5. EXPLORE MORE ENDING */}
        <section className="py-12 border-t border-slate-100 text-center">
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
              {t.exploreMoreTitle}
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed font-medium">
              {t.exploreMoreText}
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-8 px-12 py-5 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center gap-3 mx-auto font-quicksand"
            >
              <ArrowUp className="w-5 h-5" />
              {t.backToTop}
            </button>
          </motion.div>
        </section>
      </div>

    </div>
  );
};

export default LandingPage;
