import React, { RefObject } from 'react';
import { AppTab, Language } from '../types';
import { ArrowRight } from 'lucide-react';

interface LandingNavCardsProps {
  lang: Language;
  onNavigate?: (tab: AppTab, options?: { openScanner?: boolean }) => void;
  cardsSectionRef: RefObject<HTMLElement>;
  navCards: Array<{
    id: AppTab;
    title: Record<string, string>;
    image: string;
    color: string;
  }>;
  t: any;
}

const LandingNavCards: React.FC<LandingNavCardsProps> = ({ lang, onNavigate, cardsSectionRef, navCards, t }) => {
  return (
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
  );
};

export default LandingNavCards;
