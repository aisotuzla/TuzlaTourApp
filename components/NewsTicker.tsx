import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Rss, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

const NewsTicker: React.FC<{ lang: 'en' | 'bs' | 'de' | 'tr' }> = ({ lang }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [res1, res2] = await Promise.allSettled([
          fetch('https://api.rss2json.com/v1/api.json?rss_url=https://radiotuzla.webnode.page/rss/all.xml').then(r => r.json()),
          fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.klix.ba/rss/').then(r => r.json()),
          fetch('https://api.rss2json.com/v1/api.json?rss_url=https://tip.ba/feed/atom/').then(r => r.json()),
          fetch('https://api.rss2json.com/v1/api.json?rss_url=https://tuzlanski.ba/feed/').then(r => r.json())
        ]);

        let combinedNews: NewsItem[] = [];

        if (res1.status === 'fulfilled' && res1.value.status === 'ok' && res1.value.items) {
          combinedNews = [...combinedNews, ...res1.value.items.slice(0, 5)];
        }
        if (res2.status === 'fulfilled' && res2.value.status === 'ok' && res2.value.items) {
          combinedNews = [...combinedNews, ...res2.value.items.slice(0, 5)];
        }

        // Shuffle or sort by date if needed, here we just keep them alternating roughly
        setNews(combinedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || news.length === 0) return null;

  const displayNews = [...news, ...news]; // Duplicate for seamless scrolling

  return (
    <div className="w-full bg-blue-600 border-t-[3px] border-amber-500 text-white overflow-hidden h-12 relative flex items-center shadow-[0_-8px_25px_rgba(245,158,11,0.4)]">
      <div className="absolute left-0 z-10 bg-blue-700 px-4 h-full flex items-center gap-2 border-r border-blue-500 shadow-[10px_0_20px_rgba(37,99,235,1)]">
        <Rss className="w-4 h-4 text-amber-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 hidden sm:inline-block whitespace-nowrap drop-shadow-md">
          {lang === 'bs' ? 'Lokalne Vijesti' : 'Tuzla News'}
        </span>
      </div>
      <div className="flex-1 overflow-hidden ml-12 sm:ml-[160px] flex">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="flex whitespace-nowrap gap-12 items-center min-w-max"
        >
          {displayNews.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors drop-shadow-sm"
              >
                <span className="text-xs font-bold tracking-wide">{item.title}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsTicker;
