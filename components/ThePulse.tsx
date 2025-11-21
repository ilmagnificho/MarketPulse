
import React, { useEffect, useState } from 'react';
import { FearGreedData, SentimentConfig, SentimentLevel } from '../types';
import { api } from '../services/mockSupabase';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants/translations';

const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
  [SentimentLevel.ExtremeFear]: {
    level: SentimentLevel.ExtremeFear,
    emoji: '💀',
    bgColor: 'bg-red-950',
    gradient: 'from-red-950 via-red-900 to-black',
    textColor: 'text-red-500',
    messageKey: 'pulse_extreme_fear',
    range: [0, 24]
  },
  [SentimentLevel.Fear]: {
    level: SentimentLevel.Fear,
    emoji: '😨',
    bgColor: 'bg-orange-950',
    gradient: 'from-orange-900 via-red-950 to-slate-950',
    textColor: 'text-orange-400',
    messageKey: 'pulse_fear',
    range: [25, 44]
  },
  [SentimentLevel.Neutral]: {
    level: SentimentLevel.Neutral,
    emoji: '😶',
    bgColor: 'bg-slate-900',
    gradient: 'from-slate-800 via-gray-900 to-black',
    textColor: 'text-yellow-400',
    messageKey: 'pulse_neutral',
    range: [45, 55]
  },
  [SentimentLevel.Greed]: {
    level: SentimentLevel.Greed,
    emoji: '🤑',
    bgColor: 'bg-teal-950',
    gradient: 'from-teal-900 via-green-950 to-slate-950',
    textColor: 'text-teal-400',
    messageKey: 'pulse_greed',
    range: [56, 75]
  },
  [SentimentLevel.ExtremeGreed]: {
    level: SentimentLevel.ExtremeGreed,
    emoji: '🚀',
    bgColor: 'bg-green-950',
    gradient: 'from-green-900 via-emerald-950 to-black',
    textColor: 'text-green-400',
    messageKey: 'pulse_extreme_greed',
    range: [76, 100]
  },
};

const ThePulse: React.FC = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getFearGreedIndex();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch F&G index", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[40vh] rounded-2xl animate-pulse bg-slate-900 flex items-center justify-center shadow-2xl border border-slate-800 my-2">
        <span className="text-cyan-500 font-mono text-sm flex flex-col items-center gap-2">
           <span className="block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
           {t('syncing')}
        </span>
      </div>
    );
  }

  if (!data) return null;

  const config = SENTIMENT_CONFIGS[data.level] || SENTIMENT_CONFIGS[SentimentLevel.Neutral];
  
  // Quote Logic
  const quoteKeySuffix = data.level.toLowerCase().replace(' ', '_');
  const quoteKey = `quote_${quoteKeySuffix}`;
  const authorKey = `quote_author_${quoteKeySuffix}`;
  const titleKey = `quote_title_${quoteKeySuffix}`;

  const displayedQuote = showTranslation ? t(quoteKey) : TRANSLATIONS['en'][quoteKey];
  const displayedAuthor = showTranslation ? t(authorKey) : TRANSLATIONS['en'][authorKey];
  const displayedTitle = showTranslation ? t(titleKey) : TRANSLATIONS['en'][titleKey];

  const isExtreme = data.level === SentimentLevel.ExtremeFear || data.level === SentimentLevel.ExtremeGreed;
  const shakeClass = data.level === SentimentLevel.ExtremeFear ? 'animate-shake' : '';
  const pulseClass = data.level === SentimentLevel.ExtremeGreed ? 'animate-heartbeat' : '';

  return (
    <section className={`w-full rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] overflow-hidden relative bg-gradient-to-br ${config.gradient} transition-all duration-1000 flex flex-col`}>
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      {isExtreme && <div className="absolute inset-0 bg-red-500/10 animate-pulse mix-blend-color-dodge"></div>}

      {/* Content Container: Very compact padding for mobile */}
      <div className="relative z-10 p-4 pt-6 md:p-10 flex flex-col items-center text-center">
        
        {/* Gauge Visual - Compact */}
        <div className="relative w-40 h-20 md:w-64 md:h-32 overflow-hidden mb-[-2.5rem] md:mb-[-4rem]">
           <div className="absolute top-0 left-0 w-full h-full bg-slate-800/50 rounded-t-full border-4 md:border-8 border-slate-700/50"></div>
           <div 
             className={`absolute top-0 left-0 w-full h-full rounded-t-full border-4 md:border-8 ${config.textColor.replace('text-', 'border-')} origin-bottom transition-transform duration-1000`}
             style={{ transform: `rotate(${(data.value / 100) * 180 - 180}deg)` }}
           ></div>
        </div>

        {/* Score & Emoji - Tight spacing */}
        <div className={`${shakeClass} ${pulseClass} flex flex-col items-center z-10`}>
          <div className="text-5xl md:text-8xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] select-none transform transition-transform duration-300 mb-1">
            {config.emoji}
          </div>
          <h2 className={`text-7xl md:text-9xl font-black tracking-tighter ${config.textColor} drop-shadow-2xl leading-none`}>
            {data.value}
          </h2>
        </div>

        <h3 className={`text-xl md:text-5xl font-black uppercase tracking-widest ${config.textColor} drop-shadow-lg mt-2`}>
            {data.level}
        </h3>

        {/* Message Box - Reduced padding */}
        <div className={`w-full max-w-xl text-sm md:text-2xl font-bold p-3 md:p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5 shadow-inner text-slate-100 tracking-wide mt-4`}>
          {t(config.messageKey)}
        </div>

        {/* Quote Section - Compact */}
        <div className="w-full max-w-lg mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t('quote_label')}</p>
              {language !== 'en' && (
                 <button 
                   onClick={() => setShowTranslation(!showTranslation)}
                   className="text-[9px] font-bold uppercase bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-cyan-300 transition-colors"
                 >
                   {showTranslation ? t('original_quote') : t('translate_quote')}
                 </button>
              )}
            </div>
            <blockquote className="font-serif italic text-sm md:text-xl text-slate-200 opacity-90 leading-snug min-h-[3rem] flex items-center justify-center">
              "{displayedQuote}"
            </blockquote>
            <div className="mt-1 flex flex-col items-center">
               <cite className="not-italic font-bold text-white text-xs md:text-base">{displayedAuthor}</cite>
               <span className="text-[10px] text-slate-400">{displayedTitle}</span>
            </div>
        </div>
        
        <div className={`text-[9px] opacity-50 font-mono mt-3 text-white`}>
          {t('last_updated')}: {new Date(data.timestamp).toLocaleDateString()} {new Date(data.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-black/40 mt-auto">
        <div 
          className={`h-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out ${config.textColor.replace('text-', 'bg-')}`}
          style={{ width: `${data.value}%` }}
        ></div>
      </div>
    </section>
  );
};

export default ThePulse;
