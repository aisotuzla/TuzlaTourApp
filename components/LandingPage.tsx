import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { ZoomIn } from 'lucide-react';
import type { FC } from 'react';

import { AppTab, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronRight,
  QrCode,
  X,
  Facebook,
  Linkedin,
  Share2,
  ArrowDown,
  RotateCcw,
  Loader2,
  MapPin,
  Trophy
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

const navCards = [
  { id: AppTab.CITY_GUIDE, title: { en: 'City Guide', bs: 'Gradski vodič', de: 'Stadtführer', tr: 'Şehir Rehberi' }, image: '/assets/Gallery/City Guide/GradTuzla-1.webp', color: 'blue' },
  { id: AppTab.FOOD, title: { en: 'Food', bs: 'Hrana', de: 'Essen & Trinken', tr: 'Yemek & İçecek' }, image: '/assets/Gallery/QuestQRLocations/jelo.webp', color: 'orange' },
  { id: AppTab.ACCOMMODATION, title: { en: 'Accommodation', bs: 'Smještaj', de: 'Unterkunft', tr: 'Konaklama' }, image: '/assets/Gallery/Accommodation/mellain.webp', color: 'indigo' },
  { id: AppTab.MAP, title: { en: 'Map', bs: 'Mapa', de: 'Karte', tr: 'Harita' }, image: '/assets/Gallery/QuestQRLocations/mapa.webp', color: 'blue' },
];

const externalLinks = [
  { name: 'TZTZ', url: 'https://tztz.ba', logo: '/assets/Gallery/QuestQRLocations/tztzlogo.webp' },
  { name: 'Grad Tuzla', url: 'https://grad.tuzla.ba', logo: '/assets/Gallery/QuestQRLocations/Zastava_tuzle.webp' },
  { name: 'WizzAir', url: 'https://wizzair.com', logo: '/assets/Gallery/QuestQRLocations/wizzurl.webp' },
  { name: 'Airbnb', url: 'https://www.airbnb.ba/tuzla-bosnia-and-herzegovina/stays', logo: '/assets/Gallery/QuestQRLocations/airbnbng.webp' },
];

const previewImages = Array.from({ length: 25 }, (_, i) => `/assets/Gallery/Photos/tuzla${i + 1}.webp`);

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
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const cardsSectionRef = useRef<HTMLElement>(null);


  const cleanSrc = (src?: string) => {
    if (!src) return '';
    return src.replace(/^["']|["']$/g, '');
  };

  const localHeroVideo = "/assets/Gallery/tz.mp4";
  const remoteHeroVideo = "https://cki4usi56q35b3t6.public.blob.vercel-storage.com/tz.mp4";
  const initialWebSrc = localHeroVideo;

  const [videoSrc, setVideoSrc] = useState(initialWebSrc);

  // Attempt autoplay immediately (muted for mobile compatibility)
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      setIsHeroMuted(true);
      const playPromise = heroVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsHeroPlaying(true);
            setIsHeroReady(true);
          })
          .catch((err) => {
            console.warn("Autoplay was prevented (hero image visible as background/fallback):", err);
          });
      }
    }
  }, [videoSrc]);

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
              console.warn("Autoplay with audio was blocked, continuing muted playback:", error);
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
    // Stop playback after the first play completes
    setIsHeroPlaying(false);
    setHasVideoEnded(true);
  };

  const handleReplay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHeroLoopCount(0);
    setHasVideoEnded(false);
    if (heroVideoRef.current) {
      heroVideoRef.current.currentTime = 0;
      heroVideoRef.current.play().then(() => {
        setIsHeroPlaying(true);
      }).catch((err) => {
        console.warn("Replay failed:", err);
      });
    }
  };

  const handleVideoError = () => {
    if (videoSrc !== remoteHeroVideo) {
      console.warn(`Video failed to load from ${videoSrc}. Falling back to remote asset: ${remoteHeroVideo}`);
      setVideoSrc(remoteHeroVideo);
      if (heroVideoRef.current) {
        heroVideoRef.current.load();
      }
    } else {
      console.warn("Hero video failed to load. Background hero image remains as active fallback.");
      setIsHeroPlaying(false);
      setIsHeroReady(false);
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
        /* ---------------------------------------------------- */
        /* STILOVI ZA RAČUNAR (DEFAULT)                          */
        /* ---------------------------------------------------- */
        
        /* Samsung okvir na desktopu - 450px, dark blue frame sa silver linijom, tanji okvir */
        .samsung-frame {
            position: relative;
            width: 450px; 
            max-width: 100%;
            height: 880px; 
            background: linear-gradient(145deg, #091322, #030811); 
            border-radius: 44px; 
            border: 2px solid #b8c7db; /* Silver linija */
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2),
                        0 25px 60px -12px rgba(2, 6, 23, 0.7),
                        inset 0 0 0 1px #7e93b0;
            padding: 8px; /* Tanji okvir */
            transition: all 0.3s ease;
            margin: 0 auto;
        }

        /* Unutrašnji ekran na desktopu - crna unutrašnjost */
        .samsung-screen {
            position: relative;
            width: 100%;
            height: 100%;
            background-color: #000;
            border-radius: 36px; 
            border: 1px solid rgba(184, 199, 219, 0.18);
            overflow: hidden; 
            z-index: 1;
        }

        /* Video element */
        .samsung-screen video {
            width: 100%;
            height: 100%;
            object-fit: cover; 
        }

        /* Prednja selfie kamera na vrhu (Samsung punch-hole) */
        .samsung-camera {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 35%, #0f223d 0%, #030813 75%);
            border: 1px solid #1a3359;
            box-shadow: 0 0 3px rgba(0, 0, 0, 0.85);
            z-index: 25;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Mali crni krug u sredini kamere */
        .samsung-camera-lens {
            width: 5.5px;
            height: 5.5px;
            border-radius: 50%;
            background-color: #000000;
            box-shadow: inset 0 0 1px rgba(255, 255, 255, 0.5);
        }

        /* ---------------------------------------------------- */
        /* STILOVI ZA MOBILNE UREĐAJE (Responsive)              */
        /* ---------------------------------------------------- */
        
        /* Ako je ekran uži od 768px (svi moderni telefoni) */
        @media (max-width: 767px) {
            .hero-pwa-section {
                background-color: transparent !important;
                padding: 0 !important;
                height: calc(100vh - 56px - env(safe-area-inset-top, 0px)) !important;
                height: calc(100dvh - 56px - env(safe-area-inset-top, 0px)) !important;
                min-height: calc(100dvh - 56px - env(safe-area-inset-top, 0px)) !important;
            }

            /* Pretvaramo okvir u full-screen kontejner */
            .samsung-frame {
                width: 100vw !important;
                height: 100% !important;
                min-height: 100% !important;
                border-radius: 0 !important;
                border: none !important;
                padding: 0 !important;
                box-shadow: none !important;
                background-color: transparent !important;
            }

            /* Ekran telefona zauzima 100% mobilnog ekrana */
            .samsung-screen {
                width: 100% !important;
                height: 100% !important;
                border-radius: 0 !important;
                border: none !important;
                background-color: transparent !important;
            }

            /* Sakrivamo selfie kameru jer je korisnik na pravom telefonu */
            .samsung-camera {
                display: none !important;
            }
        }
      `}</style>

      {/* 1. HERO SECTION - Samsung PWA Video Wrapper */}
      <section className="hero-pwa-section relative w-full flex flex-col items-center justify-center bg-slate-100 py-6 md:py-12 overflow-hidden">
        {/* Subtle ambient lighting on desktop */}
        <div className="absolute inset-0 hidden md:block bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12)_0%,_rgba(241,245,249,0.9)_70%)] pointer-events-none" />

        {/* Kontejner koji reaguje na vrstu uređaja */}
        <div className="samsung-frame group/hero">
          <div className="samsung-screen">
            {/* Front selfie camera simulation - tamno plavi krug sa malim crnim krugom u centru */}
            <div className="samsung-camera">
              <div className="samsung-camera-lens" />
            </div>

            {/* Ended State: slaptz.webp covers entire frame */}
            {hasVideoEnded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <img
                  src="/assets/slaptz.webp"
                  alt="Tuzla Slap"
                  className="w-full h-full object-cover select-none"
                />
                <button
                  type="button"
                  onClick={handleReplay}
                  className="absolute bottom-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-xl active:scale-95 transition-all cursor-pointer"
                  title="Watch video again"
                  aria-label="Watch video again"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Video</span>
                </button>
              </div>
            )}

            {/* Fallback image */}
            <img
              src="/assets/slaptz.webp"
              alt="Tuzla Hero Fallback"
              loading="eager"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${isHeroPlaying ? 'opacity-0' : 'opacity-100'
                }`}
            />

            {/* Video koji na mobilnom postaje Full Size - pušta se 2 puta */}
            <video
              ref={heroVideoRef}
              autoPlay
              muted={isHeroMuted}
              onPlay={() => {
                setIsHeroPlaying(true);
                setIsHeroReady(true);
              }}
              onLoadedData={() => setIsHeroReady(true)}
              onError={handleVideoError}
              onEnded={handleHeroVideoEnd}
              className={`w-full h-full object-cover transition-opacity duration-700 ${isHeroPlaying ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <source src={videoSrc} type="video/mp4" />
              Vaš browser ne podržava video element.
            </video>

            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="p-4 rounded-2xl bg-black/80 border border-white/10 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-[11px] font-black uppercase text-white tracking-widest">Loading...</span>
                </div>
              </div>
            )}

            {/* Video Audio & Playback Controls on Screen */}
            {!hasVideoEnded && (
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHeroMuted((prev) => {
                      const next = !prev;
                      if (heroVideoRef.current) {
                        heroVideoRef.current.muted = next;
                      }
                      return next;
                    });
                  }}
                  className="p-2.5 rounded-full bg-slate-950/75 hover:bg-slate-900/95 text-white backdrop-blur-md border border-white/20 shadow-lg active:scale-90 transition-all cursor-pointer"
                  title={isHeroMuted ? 'Unmute video' : 'Mute video'}
                  aria-label={isHeroMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isHeroMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHeroVideo();
                  }}
                  className="p-2.5 rounded-full bg-slate-950/75 hover:bg-slate-900/95 text-white backdrop-blur-md border border-white/20 shadow-lg active:scale-90 transition-all cursor-pointer"
                  title={isHeroPlaying ? 'Pause video' : 'Play video'}
                  aria-label={isHeroPlaying ? 'Pause video' : 'Play video'}
                >
                  {isHeroPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 text-blue-400" />}
                </button>
              </div>
            )}

            {/* Mobile Scroll Indicator */}
            <div className="absolute bottom-5 left-4 z-30 md:hidden flex items-center gap-1.5 text-white pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <ArrowDown className="w-4 h-4 animate-bounce text-cyan-300 drop-shadow" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white drop-shadow">{t.heroScroll}</span>
            </div>
          </div>
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

        {/* 2.3 QUEST GAME BANNER - "Discover Tuzla - Quest" */}
        {(() => {
          const tr = (TRANSLATIONS as any)[lang] || (TRANSLATIONS as any).en;
          return (
            <section className="mt-8 mb-4">
              <button
                onClick={() => onNavigate?.(AppTab.QUEST)}
                className="group relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-2 border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all duration-500 hover:-translate-y-1 hover:border-blue-400 cursor-pointer text-left"
                style={{ minHeight: '100px' }}
              >
                {/* Background gradient matching blue cards */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900" />

                {/* Animated / Ambient pattern overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 15% 50%, rgba(59,130,246,0.35) 0%, transparent 60%),
                    radial-gradient(circle at 85% 50%, rgba(255,247,28,0.15) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(37,99,235,0.2) 0%, transparent 70%)`
                }} />

                {/* Floating QR code decorative elements */}
                <div className="absolute top-2 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                  <QrCode className="w-16 h-16 text-blue-300" />
                </div>
                <div className="absolute bottom-2 left-6 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                  <MapPin className="w-10 h-10 text-blue-400" />
                </div>

                {/* Content */}
                <div className="relative z-10 px-5 py-4 sm:px-8 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Tag + Title + Description */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.0 py-0.4 rounded-full bg-blue-500/20 border border-blue-400/40 text-[8px] font-black uppercase tracking-[0.2em] text-blue-200 backdrop-blur-sm">
                        {tr.questCardTag}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      Discover Tuzla — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF71C] to-[#D3B300]">Quest</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-blue-100/80 leading-normal max-w-xl">
                      {tr.questCardLine}
                    </p>
                  </div>

                  {/* Right: Golden to Yellow Button (#D3B300 to #FFF71C) */}
                  <div className="shrink-0 flex items-center pt-1 md:pt-0">
                    <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D3B300] to-[#FFF71C] text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,247,28,0.35)] group-hover:shadow-[0_0_25px_rgba(255,247,28,0.7)] group-hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2">
                      <span>{tr.questCardCta}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>

                {/* Bottom blue shimmer line matching other cards */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </section>
          );
        })()}

        {/* 2.5. Pannonica Special */}
        <div className="w-full mt-8 relative rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-blue-400/40 transition-all duration-300 group">
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
                <img src={src} alt={`Tuzla Photo ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/10 transition-colors" />
              </button>
            ))}
          </div>


        </section>


        {/* 4.6. SOCIAL & COMMUNITY (DIRECTLY BELOW GALLERY) */}
        <section className="pt-8 pb-4">
          <div className="mb-8 text-center flex flex-col items-center">
            <h2 className="text-[28px] font-black text-blue-900 tracking-tight uppercase font-quicksand">
              {t.communityTitle}
            </h2>
            <div className="w-20 h-2 bg-blue-600 rounded-full mt-2" />
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center flex-wrap gap-4 sm:gap-6">
              <a href="https://x.com/AISO_tuzla" aria-label="Follow us on X (Twitter)" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors relative group">
                <img src="/assets/x.svg" alt="X" className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Twitter (X)</span>
              </a>
              <a href="https://bsky.app/profile/aisotuzla.bsky.social" aria-label="Follow us on Bluesky" className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-[#0285FF] hover:bg-[#0285FF]/10 transition-colors relative group">
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

            {/* AISO TUZLA LINK */}
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

            {/* GIPS & POVRATAK NA VRH SIDE-BY-SIDE BENEATH AISO TUZLA */}
            <div className="w-full flex flex-wrap justify-center items-end gap-6 sm:gap-10 mt-2 mb-6">
              {/* GIPS BUS TRACKING */}
              <a
                href="https://www.gipstk.com/red-voznje/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-between p-3 rounded-3xl hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:scale-[1.02] transition-all duration-500 active:scale-95 bg-white/0 hover:bg-white/50 w-[240px]"
              >
                <div className="w-[240px] h-[150px] bg-white rounded-2xl shadow-lg border border-blue-100 flex items-center justify-center overflow-hidden group-hover:shadow-blue-200 group-hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="/assets/Gallery/gipslogo.png"
                    alt="GIPS Logo"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="mt-3 text-xs font-bold text-blue-700 uppercase tracking-wider text-center group-hover:text-blue-900 transition-colors">
                  {t.gipsLabel}
                </span>
              </a>

              {/* POVRATAK NA VRH VIA IMAGE */}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group flex flex-col items-center justify-between p-3 rounded-3xl hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:scale-[1.02] transition-all duration-500 active:scale-95 bg-white/0 hover:bg-white/50 cursor-pointer w-[240px]"
                title={t.backToTop}
                aria-label={t.backToTop}
              >
                <img
                  src="/assets/Gallery/ilovebos.webp"
                  alt="I Love Bosnia - Povratak na vrh"
                  className="w-[240px] h-[150px] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                />
                <span className="mt-3 text-xs font-bold uppercase tracking-wider text-blue-700 group-hover:text-blue-900 transition-colors">
                  {t.backToTop}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default LandingPage;
