import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Play,
  Pause,
  Square,
  Volume2,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { Language } from '../types';
import { TOUR_MEDIA_GUIDES, MediaGuide, MediaGuideSection, cleanTextForSpeech } from '../constants/tourMediaGuides';
import { playTTS, pauseTTS, resumeTTS, stopTTS } from '../utils/tts';

interface MediaAudioGuideTabProps {
  lang: Language;
}

interface PlayQueueItem {
  guideId: string;
  sectionId: string;
  title: string;
  lang: 'bs' | 'en';
  text: string;
}

export const MediaAudioGuideTab: React.FC<MediaAudioGuideTabProps> = ({ lang }) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Playback state
  const [queue, setQueue] = useState<PlayQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');

  const queueRef = useRef<PlayQueueItem[]>([]);
  const currentIndexRef = useRef<number>(-1);

  queueRef.current = queue;
  currentIndexRef.current = currentIndex;

  const currentItem = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, []);

  const playQueueItemAtIndex = (index: number, queueItems: PlayQueueItem[]) => {
    if (index < 0 || index >= queueItems.length) {
      stopTTS();
      setPlaybackState('idle');
      setCurrentIndex(-1);
      setQueue([]);
      return;
    }

    const item = queueItems[index];
    setCurrentIndex(index);
    setPlaybackState('playing');

    const cleaned = cleanTextForSpeech(item.text);

    playTTS({
      text: cleaned,
      lang: item.lang,
      rate: 1.0,
      onStart: () => {
        setPlaybackState('playing');
      },
      onPause: () => {
        setPlaybackState('paused');
      },
      onResume: () => {
        setPlaybackState('playing');
      },
      onEnd: () => {
        const nextIdx = index + 1;
        if (nextIdx < queueItems.length) {
          playQueueItemAtIndex(nextIdx, queueItems);
        } else {
          setPlaybackState('idle');
          setCurrentIndex(-1);
          setQueue([]);
        }
      },
      onError: (err) => {
        console.warn('TTS Playback error:', err);
        setPlaybackState('idle');
        setCurrentIndex(-1);
        setQueue([]);
      },
    });
  };

  const handlePlaySection = (guide: MediaGuide, section: MediaGuideSection, targetLang: 'bs' | 'en') => {
    const rawText = targetLang === 'bs' ? (section.textBs || section.textEn || '') : (section.textEn || section.textBs || '');
    if (!rawText.trim()) return;

    // If already playing this exact item in the same language, toggle pause/resume
    if (currentItem?.sectionId === section.id && currentItem?.lang === targetLang) {
      if (playbackState === 'playing') {
        pauseTTS();
        setPlaybackState('paused');
      } else if (playbackState === 'paused') {
        resumeTTS();
        setPlaybackState('playing');
      }
      return;
    }

    const item: PlayQueueItem = {
      guideId: guide.id,
      sectionId: section.id,
      title: section.title[lang === 'bs' ? 'bs' : 'en'] || section.title.bs,
      lang: targetLang,
      text: rawText,
    };

    setQueue([item]);
    playQueueItemAtIndex(0, [item]);
  };

  const handlePlayEntireGuide = (guide: MediaGuide, targetLang: 'bs' | 'en') => {
    const items: PlayQueueItem[] = guide.sections
      .map((s) => {
        const rawText = targetLang === 'bs' ? (s.textBs || s.textEn || '') : (s.textEn || s.textBs || '');
        return {
          guideId: guide.id,
          sectionId: s.id,
          title: s.title[lang === 'bs' ? 'bs' : 'en'] || s.title.bs,
          lang: targetLang,
          text: rawText,
        };
      })
      .filter((item) => item.text.trim().length > 0);

    if (items.length === 0) return;

    setQueue(items);
    playQueueItemAtIndex(0, items);
  };

  const handlePause = () => {
    pauseTTS();
    setPlaybackState('paused');
  };

  const handleResume = () => {
    resumeTTS();
    setPlaybackState('playing');
  };

  const handleStop = () => {
    stopTTS();
    setPlaybackState('idle');
    setCurrentIndex(-1);
    setQueue([]);
  };

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredGuides = selectedGuideId === 'all'
    ? TOUR_MEDIA_GUIDES
    : TOUR_MEDIA_GUIDES.filter((g) => g.id === selectedGuideId);

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {lang === 'bs' ? 'Audio Vodič i TTS Čitanje' : 'Audio Guide & TTS Narration'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-100 text-blue-700">
                  <Headphones className="w-3 h-3 text-blue-600" />
                  Neural TTS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {lang === 'bs'
                  ? 'Kliknite na bilo koji tekst za automatsko glasovno čitanje na Bosanskom ili Engleskom jeziku'
                  : 'Click on any section to listen to instant high-quality voice readout in Bosnian or English'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-100 text-xs font-bold text-slate-600 shadow-xs">
              {TOUR_MEDIA_GUIDES.length} {lang === 'bs' ? 'Vodiča' : 'Guides'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-100 text-xs font-bold text-blue-600 shadow-xs">
              {TOUR_MEDIA_GUIDES.reduce((acc, g) => acc + g.sections.length, 0)} {lang === 'bs' ? 'Tačaka' : 'Audio Points'}
            </span>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedGuideId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedGuideId === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
          >
            {lang === 'bs' ? 'Svi Vodiči (All)' : 'All Guides'}
          </button>
          {TOUR_MEDIA_GUIDES.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGuideId(g.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedGuideId === g.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {g.title[lang === 'bs' ? 'bs' : 'en'] || g.title.bs}
            </button>
          ))}
        </div>
      </div>

      {/* Floating / Active Player Bar when Playing */}
      {playbackState !== 'idle' && currentItem && (
        <div className="sticky top-4 z-40 rounded-2xl border-2 border-blue-500 bg-slate-950 text-white p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400 flex items-center justify-center shrink-0">
              {playbackState === 'playing' ? (
                <div className="flex items-end gap-0.5 h-5">
                  <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_alternate]" style={{ height: '70%' }} />
                  <span className="w-1 bg-cyan-400 animate-[bounce_0.9s_infinite_alternate]" style={{ height: '100%' }} />
                  <span className="w-1 bg-cyan-400 animate-[bounce_0.7s_infinite_alternate]" style={{ height: '50%' }} />
                  <span className="w-1 bg-cyan-400 animate-[bounce_0.8s_infinite_alternate]" style={{ height: '85%' }} />
                </div>
              ) : (
                <Pause className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  {playbackState === 'playing' ? (lang === 'bs' ? 'Trenutno Čita:' : 'Now Playing:') : (lang === 'bs' ? 'Pauzirano' : 'Paused')}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-white/10 text-white">
                  {currentItem.lang === 'bs' ? '🇧🇦 Bosanski' : '🇬🇧 English'}
                </span>
              </div>
              <h4 className="text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                {currentItem.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {playbackState === 'playing' ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Pause className="w-4 h-4" />
                {lang === 'bs' ? 'Pauziraj' : 'Pause'}
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                {lang === 'bs' ? 'Nastavi' : 'Resume'}
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <Square className="w-4 h-4 fill-current" />
              {lang === 'bs' ? 'Zaustavi' : 'Stop'}
            </button>
          </div>
        </div>
      )}

      {/* Guide Blocks */}
      <div className="space-y-8">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="rounded-[2rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Guide Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                    {guide.badge[lang === 'bs' ? 'bs' : 'en'] || guide.badge.bs}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {guide.sourceFile}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {guide.title[lang === 'bs' ? 'bs' : 'en'] || guide.title.bs}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                  {guide.description[lang === 'bs' ? 'bs' : 'en'] || guide.description.bs}
                </p>
              </div>

              {/* Guide Bulk Play Actions */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {guide.supportedLangs.includes('bs') && (
                  <button
                    onClick={() => handlePlayEntireGuide(guide, 'bs')}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                    title={lang === 'bs' ? 'Preslušaj cijeli vodič na Bosanskom' : 'Play whole guide in Bosnian'}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'bs' ? 'Cijeli Vodič (BS) 🇧🇦' : 'Play All (BS) 🇧🇦'}</span>
                  </button>
                )}

                {guide.supportedLangs.includes('en') && (
                  <button
                    onClick={() => handlePlayEntireGuide(guide, 'en')}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-black text-xs shadow-md shadow-slate-900/20 transition-all active:scale-95 cursor-pointer border border-slate-700"
                    title={lang === 'bs' ? 'Preslušaj cijeli vodič na Engleskom' : 'Play whole guide in English'}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'bs' ? 'Cijeli Vodič (EN) 🇬🇧' : 'Play All (EN) 🇬🇧'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Section Cards */}
            <div className="grid grid-cols-1 gap-4">
              {guide.sections.map((section, sIdx) => {
                const isExpanded = !!expandedSections[section.id];
                const isCurrentlyPlayingBs =
                  currentItem?.sectionId === section.id &&
                  currentItem?.lang === 'bs' &&
                  playbackState === 'playing';
                const isCurrentlyPlayingEn =
                  currentItem?.sectionId === section.id &&
                  currentItem?.lang === 'en' &&
                  playbackState === 'playing';
                const isCurrentActive = currentItem?.sectionId === section.id;

                const hasBs = !!section.textBs?.trim();
                const hasEn = !!section.textEn?.trim();

                const displayTitle = section.title[lang === 'bs' ? 'bs' : 'en'] || section.title.bs;

                return (
                  <div
                    key={section.id}
                    className={`rounded-2xl border transition-all p-5 ${isCurrentActive
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-xs'
                      }`}
                  >
                    {/* Section Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {section.category && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {section.category}
                            </span>
                          )}
                          {isCurrentActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md animate-pulse">
                              <Volume2 className="w-3 h-3" />
                              {playbackState === 'playing' ? (lang === 'bs' ? 'Govori...' : 'Speaking...') : (lang === 'bs' ? 'Pauzirano' : 'Paused')}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-black text-slate-900 tracking-tight">
                          {displayTitle}
                        </h4>
                      </div>

                      {/* Readout Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {hasBs && (
                          <button
                            onClick={() => handlePlaySection(guide, section, 'bs')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${isCurrentlyPlayingBs
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
                              }`}
                            title={lang === 'bs' ? 'Pokreni audio čitanje na Bosanskom' : 'Start audio readout in Bosnian'}
                          >
                            {isCurrentlyPlayingBs ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            <span>{isCurrentlyPlayingBs ? (lang === 'bs' ? 'Pauza' : 'Pause') : 'BS 🇧🇦'}</span>
                          </button>
                        )}

                        {hasEn && (
                          <button
                            onClick={() => handlePlaySection(guide, section, 'en')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${isCurrentlyPlayingEn
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                              }`}
                            title={lang === 'bs' ? 'Pokreni audio čitanje na Engleskom' : 'Start audio readout in English'}
                          >
                            {isCurrentlyPlayingEn ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            <span>{isCurrentlyPlayingEn ? (lang === 'bs' ? 'Pauza' : 'Pause') : 'EN 🇬🇧'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => toggleExpand(section.id)}
                          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition-all cursor-pointer"
                          title={isExpanded ? (lang === 'bs' ? 'Skupi tekst' : 'Collapse text') : (lang === 'bs' ? 'Prikaži puni tekst' : 'Expand full text')}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Highlights tags if any */}
                    {section.highlights && section.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {section.highlights.map((hl, hIdx) => (
                          <span
                            key={hIdx}
                            className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md"
                          >
                            #{hl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Text Body: Preview or Full */}
                    <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-100">
                      {/* Bosnian Text Box */}
                      {hasBs && (
                        <div
                          className={`rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed transition-all ${currentItem?.sectionId === section.id && currentItem?.lang === 'bs'
                              ? 'bg-blue-100/70 border border-blue-300 text-slate-900 font-medium'
                              : 'bg-slate-50 border border-slate-100 text-slate-700'
                            }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                            <span className="flex items-center gap-1 text-blue-700">
                              🇧🇦 Bosanski Tekst
                            </span>
                            <button
                              onClick={() => handleCopy(`${section.id}-bs`, section.textBs || '')}
                              className="hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-0.5"
                              title="Copy text"
                            >
                              {copiedId === `${section.id}-bs` ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className={isExpanded ? '' : 'line-clamp-3'}>
                            {section.textBs}
                          </p>
                        </div>
                      )}

                      {/* English Text Box */}
                      {hasEn && (
                        <div
                          className={`rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed transition-all ${currentItem?.sectionId === section.id && currentItem?.lang === 'en'
                              ? 'bg-blue-100/70 border border-blue-300 text-slate-900 font-medium'
                              : 'bg-slate-50 border border-slate-100 text-slate-700'
                            }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                            <span className="flex items-center gap-1 text-slate-800">
                              🇬🇧 English Text
                            </span>
                            <button
                              onClick={() => handleCopy(`${section.id}-en`, section.textEn || '')}
                              className="hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-0.5"
                              title="Copy text"
                            >
                              {copiedId === `${section.id}-en` ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className={isExpanded ? '' : 'line-clamp-3'}>
                            {section.textEn}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
