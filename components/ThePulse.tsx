
import React, { useEffect, useState } from 'react';
import { FearGreedData, SentimentConfig, SentimentLevel } from '../types';
import { api } from '../services/mockSupabase';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants/translations';

const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
  [SentimentLevel.ExtremeFear]: {
    level: SentimentLevel.ExtremeFear,
    iconPath: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z",
    color: "text-rose-500",
    gradient: "from-rose-950/40 via-black to-black",
    messageKey: 'pulse_extreme_fear',
    range: [0, 24],
    zoneLabelKey: 'zone_extreme_fear'
  },
  [SentimentLevel.Fear]: {
    level: SentimentLevel.Fear,
    iconPath: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z",
    color: "text-orange-500",
    gradient: "from-orange-950/40 via-black to-black",
    messageKey: 'pulse_fear',
    range: [25, 44],
    zoneLabelKey: 'zone_fear'
  },
  [SentimentLevel.Neutral]: {
    level: SentimentLevel.Neutral,
    iconPath: "M5 12h14",
    color: "text-yellow-500",
    gradient: "from-yellow-950/40 via-black to-black",
    messageKey: 'pulse_neutral',
    range: [45, 55],
    zoneLabelKey: 'zone_neutral'
  },
  [SentimentLevel.Greed]: {
    level: SentimentLevel.Greed,
    iconPath: "M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941",
    color: "text-emerald-500",
    gradient: "from-emerald-950/40 via-black to-black",
    messageKey: 'pulse_greed',
    range: [56, 75],
    zoneLabelKey: 'zone_greed'
  },
  [SentimentLevel.ExtremeGreed]: {
    level: SentimentLevel.ExtremeGreed,
    iconPath: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.046 8.25 8.25 0 0 1 9 6.746v.75a8.25 8.25 0 0 0 0 16.5 8.25 8.25 0 0 0 0-16.5v-.75Zm6-3v3m-3-3h3m-3 3h3M3 18h3m-3 3h3m-3-3v3m3-3v3",
    color: "text-emerald-400",
    gradient: "from-emerald-900/40 via-black to-black",
    messageKey: 'pulse_extreme_greed',
    range: [76, 100],
    zoneLabelKey: 'zone_extreme_greed'
  },
};

const SegmentedGauge: React.FC<{ value: number, color: string }> = ({ value, color }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const gaugeSize = circumference * 0.75; // 270 deg
    const offset = circumference - ((value / 100) * gaugeSize);
    
    // Convert text-color to hex roughly for shadow
    const shadowColor = color.includes('rose') ? '#f43f5e' : 
                        color.includes('orange') ? '#f97316' : 
                        color.includes('yellow') ? '#eab308' : 
                        color.includes('emerald') ? '#10b981' : '#fff';

    return (
        <div className="relative w-64 h-64 flex items-center justify-center group/gauge">
             <div className="absolute inset-0 bg-black rounded-full opacity-50 blur-xl group-hover/gauge:opacity-75 transition-opacity" style={{ boxShadow: `0 0 40px ${shadowColor}33` }}></div>
             <svg className="w-full h-full transform rotate-[135deg] relative z-10" viewBox="0 0 100 100">
                 {/* Background Track */}
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#18181b" strokeWidth="6" strokeDasharray={`${gaugeSize} ${circumference}`} strokeLinecap="round" />
                 
                 {/* Value Arc */}
                 <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    strokeDasharray={`${gaugeSize} ${circumference}`} 
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
                 />
             </svg>
             
             {/* Center Data */}
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                 <div className={`text-7xl font-mono font-bold tracking-tighter ${color} drop-shadow-2xl animate-fade-in`}>
                     {value}
                 </div>
                 <div className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1">INDEX SCORE</div>
             </div>
        </div>
    );
};

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="w-full h-[50vh] rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden crt-scanline">
       <div className="flex gap-2 mb-4">
         {[1,2,3].map(i => (
           <div key={i} className="w-3 h-12 bg-emerald-500/20 animate-pulse" style={{ animationDelay: `${i*0.1}s` }}></div>
         ))}
       </div>
       <span className="text-emerald-500 font-mono text-sm tracking-widest animate-pulse">
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
        setQuoteIdx(Math.floor(Math.random() * 5) + 1); 
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
  
  // Quote Logic
  const quoteKeySuffix = data.level.toLowerCase().replace(' ', '_') === 'neutral' ? 'n' 
    : data.level.toLowerCase().replace(' ', '_') === 'extreme_fear' ? 'ef'
    : data.level.toLowerCase().replace(' ', '_') === 'fear' ? 'f'
    : data.level.toLowerCase().replace(' ', '_') === 'greed' ? 'g'
    : 'eg';
  
  let finalQuoteIdx = quoteIdx;
  if (!TRANSLATIONS['en'][`quote_${quoteKeySuffix}_${finalQuoteIdx}`]) finalQuoteIdx = 1;
  
  const quoteK = `quote_${quoteKeySuffix}_${finalQuoteIdx}`;
  const authorK = `author_${quoteKeySuffix}_${finalQuoteIdx}`;
  const titleK = `title_${quoteKeySuffix}_${finalQuoteIdx}`;

  const displayQuote = showTranslation ? t(quoteK) : TRANSLATIONS['en'][quoteK];
  const displayAuthor = showTranslation ? t(authorK) : TRANSLATIONS['en'][authorK];
  const displayTitle = showTranslation ? t(titleK) : TRANSLATIONS['en'][titleK];

  return (
    <section className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden relative group shadow-2xl shadow-zinc-950/50 crt-scanline`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${config.color.replace('text-', 'bg-')}`}></div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{t('last_updated')}</span>
         </div>
         <span className="text-xs font-mono text-zinc-500">{new Date(data.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
      </div>

      <div className={`relative p-6 md:p-10 flex flex-col items-center text-center bg-gradient-to-b ${config.gradient}`}>
        
        {/* Main Visualization: Segmented Ring */}
        <div className="mb-6 scale-90 md:scale-100 transition-transform">
            <SegmentedGauge value={data.value} color={config.color} />
        </div>

        {/* Zone Label & Description */}
        <div className="flex flex-col items-center z-10 max-w-xl">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-zinc-800 backdrop-blur mb-4`}>
                <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${config.color} drop-shadow-md`}>
                    {t(config.zoneLabelKey)}
                </span>
            </div>
            
            <p className="text-zinc-200 text-sm md:text-lg font-medium leading-relaxed drop-shadow-sm max-w-lg mx-auto">
                {t(config.messageKey)}
            </p>
        </div>
        
        {/* Market Catalysts Cloud */}
        {data.catalysts && data.catalysts.length > 0 && (
          <div className="mt-8 flex flex-col items-center">
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-3">{t('catalysts_title')}</span>
             <div className="flex flex-wrap justify-center gap-2">
                {data.catalysts.map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors cursor-default">
                        {cat}
                    </span>
                ))}
             </div>
          </div>
        )}

        {/* PATTERN RECOGNITION (History Table) */}
        {data.pastMatches && data.pastMatches.length > 0 && (
            <div className="w-full max-w-2xl mt-10 bg-zinc-900/20 border border-zinc-800/60 rounded-lg overflow-hidden backdrop-blur-sm">
                <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('pattern_title')}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">SIMILARITY > 90%</span>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/60 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            <th className="p-2 md:p-3 font-normal">{t('col_date')}</th>
                            <th className="p-2 md:p-3 font-normal text-center">{t('col_score')}</th>
                            <th className="p-2 md:p-3 font-normal text-right">{t('col_return')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm font-mono">
                        {data.pastMatches.slice(0, 3).map((match, idx) => (
                            <tr key={idx} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors last:border-0">
                                <td className="p-2 md:p-3 text-zinc-400">
                                    {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                </td>
                                <td className="p-2 md:p-3 text-center">
                                    <span className={`text-zinc-300 font-bold`}>
                                        {match.score}
                                    </span>
                                </td>
                                <td className={`p-2 md:p-3 text-right font-bold ${match.subsequentReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-[10px] opacity-70">{match.subsequentReturn >= 0 ? '▲' : '▼'}</span>
                                        <span>{Math.abs(match.subsequentReturn)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Quote Card */}
        <div className="w-full max-w-2xl mt-6 bg-black/40 border border-zinc-800/50 rounded-lg p-4 flex gap-4 items-start hover:border-zinc-700 transition-colors group/quote">
            <div className="hidden md:flex w-8 h-8 rounded bg-zinc-900 items-center justify-center shrink-0 text-lg border border-zinc-800 text-zinc-600 font-serif">
                "
            </div>
            <div className="flex-1 text-left">
                <div className="flex justify-between items-start gap-4">
                    <p className="text-zinc-400 font-medium text-xs md:text-sm italic leading-relaxed">
                        {displayQuote}
                    </p>
                    {language !== 'en' && (
                        <button 
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="text-[10px] font-bold text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded hover:text-white hover:border-zinc-500 uppercase shrink-0 transition-colors"
                        >
                            {showTranslation ? t('original_quote') : t('translate_quote')}
                        </button>
                    )}
                </div>
                <div className="mt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">— {displayAuthor}</span>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default ThePulse;
