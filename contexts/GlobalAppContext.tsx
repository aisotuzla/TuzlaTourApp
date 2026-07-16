import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { getAppFeatures, AppFeatures } from '../utils/platform';
import { Preferences } from '@capacitor/preferences';

interface GlobalAppContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  features: AppFeatures;
  unlockedRewards: string[];
  setUnlockedRewards: React.Dispatch<React.SetStateAction<string[]>>;
}

const GlobalAppContext = createContext<GlobalAppContextProps | undefined>(undefined);

export const GlobalAppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [lang, setLang] = useState<Language>('bs');
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const features = getAppFeatures();

  useEffect(() => {
    const loadUnlocked = async () => {
      const { value } = await Preferences.get({ key: 'tuzla_unlocked' });
      if (value) {
        try {
          setUnlockedRewards(JSON.parse(value));
        } catch {
          setUnlockedRewards(['mesa_selimovic']);
        }
      } else {
        setUnlockedRewards(['mesa_selimovic']);
      }
    };
    loadUnlocked();
  }, []);

  useEffect(() => {
    Preferences.set({ key: 'tuzla_unlocked', value: JSON.stringify(unlockedRewards) });
  }, [unlockedRewards]);

  return (
    <GlobalAppContext.Provider
      value={{
        lang,
        setLang,
        features,
        unlockedRewards,
        setUnlockedRewards,
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
