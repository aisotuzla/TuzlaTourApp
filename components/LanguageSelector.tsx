import React from 'react';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ currentLang, onSelect }) => {
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'bs', label: 'Bosnian', flag: '🇧🇦' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => onSelect(l.code)}
          className={`flex items-center justify-center text-2xl sm:text-3xl transition-all ${
            currentLang === l.code 
              ? 'scale-110 grayscale-0 opacity-100 drop-shadow-sm' 
              : 'hover:scale-105 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
          }`}
          title={l.label}
        >
          <span className="leading-none">{l.flag}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
