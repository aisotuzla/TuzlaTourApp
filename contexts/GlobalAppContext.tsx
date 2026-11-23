import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { getAppFeatures, AppFeatures } from '../utils/platform';
import { Preferences } from '@capacitor/preferences';
import { PHASE_1_POIS, PHASE_2_POIS, PHASE_3_POIS } from '../constants/questData';

interface GlobalAppContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  features: AppFeatures;
  unlockedRewards: string[];
  setUnlockedRewards: React.Dispatch<React.SetStateAction<string[]>>;
  isTvrtkoScratchOpen: boolean;
  setIsTvrtkoScratchOpen: (open: boolean) => void;
  isKulinCharterCubeOpen: boolean;
  setIsKulinCharterCubeOpen: (open: boolean) => void;
  activePhaseCelebration: 1 | 2 | 3 | null;
  setActivePhaseCelebration: (phase: 1 | 2 | 3 | null) => void;
  celebratedPhases: number[];
}

const GlobalAppContext = createContext<GlobalAppContextProps | undefined>(undefined);

export const GlobalAppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [lang, setLang] = useState<Language>('bs');
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const [hasLoadedUnlocked, setHasLoadedUnlocked] = useState(false);
  const [isTvrtkoScratchOpen, setIsTvrtkoScratchOpen] = useState(false);
  const [isKulinCharterCubeOpen, setIsKulinCharterCubeOpen] = useState(false);
  const [activePhaseCelebration, setActivePhaseCelebration] = useState<1 | 2 | 3 | null>(null);
  const [celebratedPhases, setCelebratedPhases] = useState<number[]>([]);
  const celebratedPhasesRef = useRef<number[]>([]);
  celebratedPhasesRef.current = celebratedPhases;

  const features = getAppFeatures();

  useEffect(() => {
    const loadState = async () => {
      let savedUnlocked: string[] = [];
      try {
        const { value } = await Preferences.get({ key: 'tuzla_unlocked' });
        if (value) {
          savedUnlocked = JSON.parse(value);
          setUnlockedRewards(savedUnlocked);
        } else {
          setUnlockedRewards([]);
        }
      } catch (error) {
        console.error('[Quest progress] Unable to load local progress:', error);
        setUnlockedRewards([]);
      }

      try {
        const { value: celebratedVal } = await Preferences.get({ key: 'tuzla_celebrated_phases' });
        let celebrated: number[] = [];
        if (celebratedVal) {
          try {
            celebrated = JSON.parse(celebratedVal);
          } catch {}
        } else if (savedUnlocked.length > 0) {
          // If existing progress exists on first load of this feature, mark finished phases
          if (PHASE_1_POIS.every((id) => savedUnlocked.includes(id))) celebrated.push(1);
          if (PHASE_2_POIS.every((id) => savedUnlocked.includes(id))) celebrated.push(2);
          if (PHASE_3_POIS.every((id) => savedUnlocked.includes(id))) celebrated.push(3);
          await Preferences.set({ key: 'tuzla_celebrated_phases', value: JSON.stringify(celebrated) });
        }
        setCelebratedPhases(celebrated);
      } catch (e) {
        console.warn('[Quest progress] Could not load celebrated phases:', e);
      }

      setHasLoadedUnlocked(true);
    };

    loadState().catch((error) => {
      console.error('[Quest progress] Init failed:', error);
      setUnlockedRewards([]);
      setHasLoadedUnlocked(true);
    });
  }, []);

  // Save unlocked rewards
  useEffect(() => {
    if (!hasLoadedUnlocked) return;
    Preferences.set({ key: 'tuzla_unlocked', value: JSON.stringify(unlockedRewards) })
      .catch((error) => console.error('[Quest progress] Unable to save local progress:', error));

    // Check if a phase has newly completed
    const currentCelebrated = celebratedPhasesRef.current;
    const isP1Done = PHASE_1_POIS.every((id) => unlockedRewards.includes(id));
    const isP2Done = isP1Done && PHASE_2_POIS.every((id) => unlockedRewards.includes(id));
    const isP3Done = isP2Done && PHASE_3_POIS.every((id) => unlockedRewards.includes(id));

    if (isP1Done && !currentCelebrated.includes(1)) {
      setTimeout(() => setActivePhaseCelebration(1), 400);
      const next = [...currentCelebrated, 1];
      setCelebratedPhases(next);
      Preferences.set({ key: 'tuzla_celebrated_phases', value: JSON.stringify(next) }).catch(() => {});
    } else if (isP2Done && !currentCelebrated.includes(2)) {
      setTimeout(() => setActivePhaseCelebration(2), 500);
      const next = [...currentCelebrated, 2];
      setCelebratedPhases(next);
      Preferences.set({ key: 'tuzla_celebrated_phases', value: JSON.stringify(next) }).catch(() => {});
    } else if (isP3Done && !currentCelebrated.includes(3)) {
      setTimeout(() => setActivePhaseCelebration(3), 500);
      const next = [...currentCelebrated, 3];
      setCelebratedPhases(next);
      Preferences.set({ key: 'tuzla_celebrated_phases', value: JSON.stringify(next) }).catch(() => {});
    }
  }, [unlockedRewards, hasLoadedUnlocked]);

  return (
    <GlobalAppContext.Provider
      value={{
        lang,
        setLang,
        features,
        unlockedRewards,
        setUnlockedRewards,
        isTvrtkoScratchOpen,
        setIsTvrtkoScratchOpen,
        isKulinCharterCubeOpen,
        setIsKulinCharterCubeOpen,
        activePhaseCelebration,
        setActivePhaseCelebration,
        celebratedPhases,
      }}
    >
      {children}
    </GlobalAppContext.Provider>
  );
};

export const useGlobalApp = (): GlobalAppContextProps => {
  const context = useContext(GlobalAppContext);
  if (!context) {
    throw new Error('useGlobalApp must be used within a GlobalAppProvider');
  }
  return context;
};
