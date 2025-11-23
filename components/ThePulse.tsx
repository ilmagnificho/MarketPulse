
import React, { useEffect, useState } from 'react';
import { FearGreedData, SentimentConfig, SentimentLevel, QuoteDef } from '../types';
import { api } from '../services/mockSupabase';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants/translations';

const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
  [SentimentLevel.ExtremeFear]: {
    level: SentimentLevel.ExtremeFear,
    iconPath: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z", // Exclamation
    color: "text-rose-500",
    gradient: "from-rose-950/50 via-black to-black",
    messageKey: 'pulse_extreme_fear',
    range: [0, 24]
  },
  [SentimentLevel.Fear]: {
    level: SentimentLevel.Fear,
    iconPath: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z", // Cloud
    color: "text-orange-500",
    gradient: "from-orange-950/50 via-black to-black",
    messageKey: 'pulse_fear',
    range: [25, 44]
  },
  [SentimentLevel.Neutral]: {
    level: SentimentLevel.Neutral,
    iconPath: "M5 12h14", // Minus
    color: "text-slate-400",
    gradient: "from-slate-900 via-black to-black",
    messageKey: 'pulse_neutral',
    range: [45, 55]
  },
  [SentimentLevel.Greed]: {
    level: SentimentLevel.Greed,
    iconPath: "M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941", // Trending Up
    color: "text-emerald-500",
    gradient: "from-emerald-950/50 via-black to-black",
    messageKey: 'pulse_greed',
    range: [56, 75]
  },
  [SentimentLevel.ExtremeGreed]: {
    level: SentimentLevel.ExtremeGreed,
    iconPath: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.046 8.25 8.25 0 0 1 9 6.746v.75a8.25 8.25 0 0 0 0 16.5 8.25 8.25 0 0 0 0-16.5v-.75Zm6-3v3m-3-3h3m-3 3h3M3 18h3m-3 3h3m-3-3v3m3-3v3", // Sparkles/Fire
    color: "text-emerald-400",
    gradient: "from-emerald-900/50 via-black to-black",
    messageKey: 'pulse_extreme_greed',
    range: [76, 100]
  },
};

const MiniChart: React.FC<{ trend: number[], colorClass: string }> = ({ trend, colorClass }) => {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    const points = trend.map((val, idx) => {
        const x = (idx / (trend.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
            <polyline 
                points={points} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className={`${colorClass} opacity-80 vector-effect-non-scaling-stroke`}
            />
            <circle cx="100" cy={100 - ((trend[trend.length-1] - min) / range) * 100} r="3" className={`${colorClass} animate-pulse`} fill="currentColor" />
        </svg>
    );
};

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();
  const [txt, setTxt] = useState("");
  
  useEffect(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let i = 0;
      const interval = setInterval(() => {
         setTxt(Array(8).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(""));
         i++;
         if(i > 20) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full h-[50vh] rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
       <div className="text-emerald-500 font-mono text-4xl md:text-6xl font-bold tracking-tighter animate-pulse">
          {txt}
       </div>
       <span className="text-zinc-500 font-mono text-[10px] mt-4 tracking-[0.2em] uppercase">
         {t('syncing')}
       </span>
    </section>
  );
};

const ThePulse: React.FC = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(1);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getFearGreedIndex();
        setData(result);
        // Randomize quote between 1 and 3 (or 2 depending on level availability, simplistic approach here)
        setQuoteIdx(Math.floor(Math.random() * 2) + 1); 
      } catch (error) {
        console.error("Failed to fetch F&G index", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data) return null;

  const config = SENTIMENT_CONFIGS[data.level] || SENTIMENT_CONFIGS[SentimentLevel.Neutral];
  
  // Dynamic Quote Logic
  const quoteKeySuffix = data.level.toLowerCase().replace(' ', '_') === 'neutral' ? 'n' 
    : data.level.toLowerCase().replace(' ', '_') === 'extreme_fear' ? 'ef'
    : data.level.toLowerCase().replace(' ', '_') === 'fear' ? 'f'
    : data.level.toLowerCase().replace(' ', '_') === 'greed' ? 'g'
    : 'eg'; // extreme greed

  // Try to get random quote, fallback to 1 if missing
  let finalQuoteIdx = quoteIdx;
  // Simple check if quote 3 exists, if not try 2, else 1
  if (!TRANSLATIONS['en'][`quote_${quoteKeySuffix}_${finalQuoteIdx}`]) finalQuoteIdx = 1;
  
  const quoteK = `quote_${quoteKeySuffix}_${finalQuoteIdx}`;
  const authorK = `author_${quoteKeySuffix}_${finalQuoteIdx}`;
  const titleK = `title_${quoteKeySuffix}_${finalQuoteIdx}`;

  const displayQuote = showTranslation ? t(quoteK) : TRANSLATIONS['en'][quoteK];
  const displayAuthor = showTranslation ? t(authorK) : TRANSLATIONS['en'][authorK];
  const displayTitle = showTranslation ? t(titleK) : TRANSLATIONS['en'][titleK];

  const isExtreme = data.level === SentimentLevel.ExtremeFear || data.level === SentimentLevel.ExtremeGreed;

  return (
    <section className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden relative group`}>
      
      {/* Header Status Bar */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-sm">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isExtreme ? 'animate-pulse' : ''} ${config.color.replace('text-', 'bg-')}`}></div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{t('last_updated')}</span>
         </div>
         <span className="text-[10px] font-mono text-zinc-600">{new Date(data.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} UTC</span>
      </div>

      <div className={`relative p-6 md:p-8 flex flex-col items-center text-center bg-gradient-to-b ${config.gradient}`}>
        
        {/* Main Gauge Visual */}
        <div className="relative w-64 h-32 mb-4 overflow-hidden">
           {/* Background Arc */}
           <div className="absolute top-0 left-0 w-full h-full rounded-t-full border-[16px] border-zinc-800"></div>
           {/* Active Arc */}
           <div 
             className={`absolute top-0 left-0 w-full h-full rounded-t-full border-[16px] ${config.color.replace('text-', 'border-')} origin-bottom transition-transform duration-1000 ease-out`}
             style={{ transform: `rotate(${(data.value / 100) * 180 - 180}deg)` }}
           ></div>
        </div>

        {/* Main Score */}
        <div className="flex flex-col items-center -mt-20 z-10">
            <div className={`text-7xl md:text-8xl font-mono font-bold tracking-tighter ${config.color} drop-shadow-2xl`}>
                {data.value}
            </div>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-zinc-900/80 rounded-full border border-zinc-700 backdrop-blur">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${config.color}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={config.iconPath} />
                </svg>
                <span className={`text-sm md:text-base font-bold uppercase tracking-wide text-zinc-200`}>
                    {data.level}
                </span>
            </div>
        </div>

        <p className="mt-6 text-zinc-400 text-sm md:text-lg font-medium max-w-md leading-relaxed">
            {t(config.messageKey)}
        </p>

        {/* HISTORICAL FRACTAL (Polymarket Style Card) */}
        {data.history && (
            <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4">
                
                {/* Left: Data Context */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{t('deja_vu_title')}</p>
                        <div className="flex items-baseline gap-2">
                             <h4 className="text-lg font-bold text-zinc-200">{t('last_seen')}</h4>
                        </div>
                        <p className="text-2xl font-mono text-white font-medium mt-1">
                            {new Date(data.history.lastSeenDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {data.history.daysAgo} {t('days_ago')}
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                         <div>
                             <p className="text-[9px] font-mono text-zinc-500 mb-1">NASDAQ 100</p>
                             <p className={`font-mono text-sm font-bold ${data.history.nasdaqChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.history.nasdaqChange > 0 ? '+' : ''}{data.history.nasdaqChange}%
                             </p>
                         </div>
                         <div>
                             <p className="text-[9px] font-mono text-zinc-500 mb-1">S&P 500</p>
                             <p className={`font-mono text-sm font-bold ${data.history.nyseChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.history.nyseChange > 0 ? '+' : ''}{data.history.nyseChange}%
                             </p>
                         </div>
                    </div>
                </div>

                {/* Right: Visual Trend */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col relative">
                     <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">{t('market_trend')}</p>
                     <div className="flex-1 w-full h-20 md:h-auto">
                        <MiniChart 
                            trend={data.history.trend} 
                            colorClass={data.history.trend[data.history.trend.length-1] >= data.history.trend[0] ? 'text-emerald-500' : 'text-rose-500'} 
                        />
                     </div>
                     <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-2">
                         <span>T-0</span>
                         <span>NOW</span>
                     </div>
                </div>
            </div>
        )}

        {/* Quote Card - Professional */}
        <div className="w-full max-w-2xl mt-4 bg-black border border-zinc-800 rounded-lg p-4 flex gap-4 items-start hover:border-zinc-600 transition-colors group/quote">
            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0 text-xl">
                💬
            </div>
            <div className="flex-1 text-left">
                <div className="flex justify-between items-start">
                    <p className="text-zinc-300 font-medium text-sm md:text-base italic leading-relaxed pr-4">
                        "{displayQuote}"
                    </p>
                    {language !== 'en' && (
                        <button 
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="text-[9px] font-bold text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded hover:text-white hover:border-zinc-500 uppercase"
                        >
                            {showTranslation ? t('original_quote') : t('translate_quote')}
                        </button>
                    )}
                </div>
                <div className="mt-2 flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">{displayAuthor}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">{displayTitle}</span>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default ThePulse;
