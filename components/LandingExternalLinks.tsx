import React from 'react';
import { Language } from '../types';
import { ArrowRight } from 'lucide-react';

interface LandingExternalLinksProps {
  lang: Language;
  t: any;
}

const externalLinks = [
  { name: 'TZTZ', url: 'https://tztz.ba', logo: '/assets/Gallery/QuestQRLocations/tztzlogo.webp' },
  { name: 'Grad Tuzla', url: 'https://grad.tuzla.ba', logo: '/assets/Gallery/QuestQRLocations/Zastava_tuzle.webp' },
  { name: 'WizzAir', url: 'https://wizzair.com', logo: '/assets/Gallery/QuestQRLocations/wizzurl.webp' },
  { name: 'Ilincica', url: 'https://ilincica.ba', logo: '/assets/Gallery/QuestQRLocations/ilincicaba.webp' },
];

const LandingExternalLinks: React.FC<LandingExternalLinksProps> = ({ lang, t }) => {
  return (
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
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900/60 group-hover:text-blue-600 transition-colors">
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default LandingExternalLinks;
