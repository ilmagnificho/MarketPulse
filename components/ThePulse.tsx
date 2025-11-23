
import React, { useEffect, useState } from 'react';
import { FearGreedData, SentimentConfig, SentimentLevel, HistoryEvent } from '../types';
import { api } from '../services/mockSupabase';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants/translations';

const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
  [SentimentLevel.ExtremeFear]: {
    level: SentimentLevel.ExtremeFear,
    iconPath: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z",
    color: "text-rose-500",
    gradient: "from-rose-950/50 via-black to-black",
    messageKey: 'pulse_extreme_fear',
    range: [0, 24],
    zoneLabelKey: 'zone_extreme_fear'
  },
  [SentimentLevel.Fear]: {
    level: SentimentLevel.Fear,
    iconPath: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z",
    color: "text-orange-500",
    gradient: "from-orange-950/50 via-black to-black",
    messageKey: 'pulse_fear',
    range: [25, 44],
    zoneLabelKey: 'zone_fear'
  },
  [SentimentLevel.Neutral]: {
    level: SentimentLevel.Neutral,
    iconPath: "M5 12h14",
    color: "text-yellow-500",
    gradient: "from-yellow-950/50 via-black to-black",
    messageKey: 'pulse_neutral',
    range: [45, 55],
    zoneLabelKey: 'zone_neutral'
  },
  [SentimentLevel.Greed]: {
    level: SentimentLevel.Greed,
    iconPath: "M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941",
    color: "text-emerald-500",
    gradient: "from-emerald-950/50 via-black to-black",
    messageKey: 'pulse_greed',
    range: [56, 75],
    zoneLabelKey: 'zone_greed'
  },
  [SentimentLevel.ExtremeGreed]: {
    level: SentimentLevel.ExtremeGreed,
    iconPath: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.046 8.25 8.25 0 0 1 9 6.746v.75a8.25 8.25 0 0 0 0 16.5 8.25 8.25 0 0 0 0-16.5v-.75Zm6-3v3m-3-3h3m-3 3h3M3 18h3m-3 3h3m-3-3v3m3-3v3",
    color: "text-emerald-400",
    gradient: "from-emerald-900/50 via-black to-black",
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
    
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
             <svg className="w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
                 {/* Background Track */}
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#18181b" strokeWidth="8" strokeDasharray={`${gaugeSize} ${circumference}`} strokeLinecap="round" />
                 
                 {/* Value Arc */}
                 <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray={`${gaugeSize} ${circumference}`} 
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-1000 ease-out`}
                 />
             </svg>
             
             {/* Center Data */}
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <div className={`text-7xl font-mono font-bold tracking-tighter ${color} drop-shadow-2xl`}>
                     {value}
                 </div>
             </div>
        </div>
    );
};

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="w-full h-[50vh] rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
       <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
       <span className="text-zinc-400 font-mono text-xs tracking-widest animate-pulse">
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
        // Randomly select from available quotes (now up to 5)
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
  // Fallback to 1 if random index doesn't exist in translation file
  if (!TRANSLATIONS['en'][`quote_${quoteKeySuffix}_${finalQuoteIdx}`]) finalQuoteIdx = 1;
  
  const quoteK = `quote_${quoteKeySuffix}_${finalQuoteIdx}`;
  const authorK = `author_${quoteKeySuffix}_${finalQuoteIdx}`;
  const titleK = `title_${quoteKeySuffix}_${finalQuoteIdx}`;

  const displayQuote = showTranslation ? t(quoteK) : TRANSLATIONS['en'][quoteK];
  const displayAuthor = showTranslation ? t(authorK) : TRANSLATIONS['en'][authorK];
  const displayTitle = showTranslation ? t(titleK) : TRANSLATIONS['en'][titleK];

  return (
    <section className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden relative group`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-sm">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${config.color.replace('text-', 'bg-')}`}></div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{t('last_updated')}</span>
         </div>
         <span className="text-xs font-mono text-zinc-500">{new Date(data.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
      </div>

      <div className={`relative p-6 md:p-10 flex flex-col items-center text-center bg-gradient-to-b ${config.gradient}`}>
        
        {/* Main Visualization: Segmented Ring */}
        <div className="mb-6">
            <SegmentedGauge value={data.value} color={config.color} />
        </div>

        {/* Zone Label & Description */}
        <div className="flex flex-col items-center z-10 max-w-xl">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/90 rounded-full border border-zinc-700 backdrop-blur mb-4`}>
                <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${config.color}`}>
                    {t(config.zoneLabelKey)}
                </span>
            </div>
            
            <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed">
                {t(config.messageKey)}
            </p>
        </div>

        {/* PATTERN RECOGNITION (History Table) */}
        {data.pastMatches && data.pastMatches.length > 0 && (
            <div className="w-full max-w-2xl mt-10 bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-zinc-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{t('pattern_title')}</span>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            <th className="p-3 font-normal">{t('col_date')}</th>
                            <th className="p-3 font-normal text-center">{t('col_score')}</th>
                            <th className="p-3 font-normal text-right">{t('col_return')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm font-mono">
                        {data.pastMatches.map((match, idx) => (
                            <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors last:border-0">
                                <td className="p-3 text-zinc-300">
                                    {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs ${Math.abs(match.score - data.value) <= 2 ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>
                                        {match.score}
                                    </span>
                                </td>
                                <td className={`p-3 text-right font-bold ${match.subsequentReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-xs">{match.subsequentReturn >= 0 ? '▲' : '▼'}</span>
                                        <span>{Math.abs(match.subsequentReturn)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-2 bg-zinc-900/30 text-center border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 italic">{t('pattern_desc')}</p>
                </div>
            </div>
        )}

        {/* Quote Card */}
        <div className="w-full max-w-2xl mt-8 bg-black border border-zinc-800 rounded-lg p-4 flex gap-4 items-start hover:border-zinc-600 transition-colors group/quote">
            <div className="hidden md:flex w-10 h-10 rounded bg-zinc-900 items-center justify-center shrink-0 text-xl border border-zinc-800 text-zinc-500">
                ❝
            </div>
            <div className="flex-1 text-left">
                <div className="flex justify-between items-start gap-4">
                    <p className="text-zinc-300 font-medium text-sm md:text-base italic leading-relaxed">
                        "{displayQuote}"
                    </p>
                    {language !== 'en' && (
                        <button 
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="text-xs font-bold text-zinc-500 border border-zinc-700 px-2 py-1 rounded hover:text-white hover:border-zinc-500 uppercase shrink-0"
                        >
                            {showTranslation ? t('original_quote') : t('translate_quote')}
                        </button>
                    )}
                </div>
                <div className="mt-3 flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">{displayAuthor}</span>
                    <span className="text-[11px] text-zinc-500 uppercase mt-0.5">{displayTitle}</span>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default ThePulse;
