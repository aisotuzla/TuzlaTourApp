import React from 'react';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ currentLang, onSelect }) => {
  const languages: { code: Language; flagUrl: string; label: string }[] = [
    { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
    { code: 'bs', label: 'Bosnian', flagUrl: 'https://flagcdn.com/w40/ba.png' },
    { code: 'de', label: 'Deutsch', flagUrl: 'https://flagcdn.com/w40/de.png' },
    { code: 'tr', label: 'Türkçe', flagUrl: 'https://flagcdn.com/w40/tr.png' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => onSelect(l.code)}
          className={`flex items-center justify-center text-2xl sm:text-3xl transition-all ${currentLang === l.code
              ? 'scale-110 grayscale-0 opacity-100 drop-shadow-sm'
              : 'hover:scale-105 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
            }`}
          title={l.label}
        >
          <img src={l.flagUrl} alt={l.label} className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded shadow-sm" />
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
