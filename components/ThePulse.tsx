
import React, { useEffect, useState } from 'react';
import { FearGreedData, SentimentConfig, SentimentLevel } from '../types';
import { api } from '../services/mockSupabase';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants/translations';

const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
  [SentimentLevel.ExtremeFear]: {
    level: SentimentLevel.ExtremeFear,
    iconPath: "",
    color: "text-neon-red drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    gradient: "from-rose-500 to-rose-600",
    messageKey: 'pulse_extreme_fear',
    range: [0, 24],
    zoneLabelKey: 'zone_extreme_fear'
  },
  [SentimentLevel.Fear]: {
    level: SentimentLevel.Fear,
    iconPath: "",
    color: "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]",
    gradient: "from-orange-500 to-orange-600",
    messageKey: 'pulse_fear',
    range: [25, 44],
    zoneLabelKey: 'zone_fear'
  },
  [SentimentLevel.Neutral]: {
    level: SentimentLevel.Neutral,
    iconPath: "",
    color: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
    gradient: "from-yellow-400 to-yellow-500",
    messageKey: 'pulse_neutral',
    range: [45, 55],
    zoneLabelKey: 'zone_neutral'
  },
  [SentimentLevel.Greed]: {
    level: SentimentLevel.Greed,
    iconPath: "",
    color: "text-neon-green drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    gradient: "from-emerald-400 to-emerald-500",
    messageKey: 'pulse_greed',
    range: [56, 75],
    zoneLabelKey: 'zone_greed'
  },
  [SentimentLevel.ExtremeGreed]: {
    level: SentimentLevel.ExtremeGreed,
    iconPath: "",
    color: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    gradient: "from-emerald-500 to-emerald-600",
    messageKey: 'pulse_extreme_greed',
    range: [76, 100],
    zoneLabelKey: 'zone_extreme_greed'
  },
};

// Cyberpunk Ring Chart
const FintechRing: React.FC<{ value: number, config: SentimentConfig }> = ({ value, config }) => {
    const size = 260;
    const strokeWidth = 16;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center py-8">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] opacity-20 ${config.color.split(' ')[0].replace('text-', 'bg-')}`}></div>

            <div style={{ width: size, height: size }} className="relative z-10">
                <svg className="transform -rotate-90 w-full h-full">
                    {/* Track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                    />
                    {/* Indicator */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${config.color}`}
                        style={{ filter: 'url(#glow)' }}
                    />
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
                
                {/* Center Content: Big Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-7xl font-black tracking-tighter text-white text-glow-lg`}>
                        {Math.round(value)}
                    </span>
                    <span className={`text-sm font-bold mt-2 uppercase tracking-widest ${config.color}`}>
                        {config.level}
                    </span>
                </div>
            </div>
        </div>
    );
};

// List Style matches the "Portfolio positions" in reference
const HistoryItem: React.FC<{ label: string, value: number }> = ({ label, value }) => {
    const isGreed = value > 55;
    const isFear = value < 45;
    const colorClass = isGreed ? 'text-neon-green' : isFear ? 'text-neon-red' : 'text-yellow-400';
    const bgClass = isGreed ? 'bg-emerald-500/10' : isFear ? 'bg-rose-500/10' : 'bg-yellow-500/10';

    return (
        <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-default group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
                    <span className={`font-bold text-sm ${colorClass}`}>{Math.round(value)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-bold text-gray-200 group-hover:text-white transition-colors">{label}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Sentiment Score</span>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-base font-mono font-medium ${colorClass} text-glow`}>
                    {value}
                </span>
            </div>
        </div>
    );
};

const ThePulse: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getFearGreedIndex();
        setData(result);
        setQuoteIdx(Math.floor(Math.random() * 5) + 1);
      } catch (error) {
        console.error("Failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) return (
      <div className="h-96 flex items-center justify-center">
          <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-neon-blue rounded-full animate-spin"></div>
          </div>
      </div>
  );

  const config = SENTIMENT_CONFIGS[data.level] || SENTIMENT_CONFIGS[SentimentLevel.Neutral];

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

  // REVERSED LOGIC: Default is Local Language via t(), Toggle is English Original
  const displayQuote = showOriginal ? TRANSLATIONS['en'][quoteK] : t(quoteK);
  const displayAuthor = showOriginal ? TRANSLATIONS['en'][authorK] : t(authorK);
  const displayTitle = showOriginal ? TRANSLATIONS['en'][titleK] : t(titleK);

  return (
    <section className="w-full max-w-md mx-auto space-y-6">
      
      {/* 1. Main Dashboard Card */}
      <div className="app-card overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/20 blur-[80px] rounded-full pointer-events-none"></div>
         
         <div className="p-6 pb-0 relative z-10">
             <span className="text-neon-purple font-bold text-xs uppercase tracking-widest border border-neon-purple/30 px-2 py-1 rounded bg-neon-purple/10">
                 {t('market_sentiment')}
             </span>
             <h2 className="text-3xl font-black text-white mt-3 tracking-tight">Fear & Greed Index</h2>
         </div>

         <FintechRing value={data.value} config={config} />
         
         <div className="px-6 pb-8 text-center relative z-10">
             <p className="text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-4">
                 {t(config.messageKey)}
             </p>
         </div>
      </div>

      {/* 2. History List & Pattern Recognition */}
      <div className="app-card overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center gap-2">
              <div className="w-1 h-4 bg-neon-blue rounded-full"></div>
              <h3 className="font-bold text-lg text-white tracking-tight">{t('historical_data')}</h3>
          </div>
          
          {/* Timeline Data */}
          <div className="flex flex-col">
              {data.timeline && (
                  <>
                    <HistoryItem label={t('previous_close')} value={data.timeline.previousClose} />
                    <HistoryItem label={t('one_week_ago')} value={data.timeline.oneWeekAgo} />
                    <HistoryItem label={t('one_month_ago')} value={data.timeline.oneMonthAgo} />
                    <HistoryItem label={t('one_year_ago')} value={data.timeline.oneYearAgo} />
                  </>
              )}
          </div>

          {/* Pattern Recognition Table (Restored) */}
          <div className="p-5 border-t border-white/10 bg-white/[0.02]">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-neon-purple text-base">⚡</span> {t('pattern_title')}
                </h4>
                
                {/* Table Header */}
                <div className="grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    <div>{t('col_date')}</div>
                    <div className="text-center">{t('col_score')}</div>
                    <div className="text-right">{t('col_return')}</div>
                </div>

                {/* Rows */}
                <div className="space-y-1">
                    {data.pastMatches.map((match, i) => (
                        <div key={i} className="grid grid-cols-3 items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="text-xs text-gray-300 font-mono">
                                {new Date(match.date).toLocaleDateString(undefined, {year: '2-digit', month: '2-digit', day: '2-digit'})}
                            </div>
                            <div className="text-center">
                                <span className={`text-xs font-bold font-mono ${match.score > 55 ? 'text-neon-green' : match.score < 45 ? 'text-neon-red' : 'text-yellow-400'}`}>
                                    {match.score}
                                </span>
                            </div>
                            <div className="text-right font-mono text-xs font-bold">
                                <span className={match.subsequentReturn >= 0 ? 'text-neon-green' : 'text-neon-red'}>
                                    {match.subsequentReturn >= 0 ? '+' : ''}{match.subsequentReturn}%
                                </span>
                            </div>
                        </div>
                    ))}
                    {data.pastMatches.length === 0 && (
                         <div className="text-center text-xs text-gray-600 py-4 italic">No patterns found</div>
                    )}
                </div>
          </div>
      </div>

      {/* 3. Quote Card */}
      <div className="app-card p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.00001 15 9.00001 15 9.00001 15C9.00001 11.5163 10.9753 8.35338 14.1685 6.78453L15.068 6.34259L14.1856 5.44441C13.626 4.87483 12.8631 4.56214 12.068 4.56824C9.52229 4.58882 7.00001 7.15234 7.00001 11V16C7.00001 18.7614 9.23858 21 12.0001 21H14.017ZM8.00001 23H12.0001C15.8661 23 19.0001 19.866 19.0001 16V11C19.0001 5.59022 15.6596 2.01255 12.0279 2.00019C10.7493 1.99042 9.53036 2.49252 8.63604 3.40259L4.36423 7.74996C3.99395 8.12683 3.90637 8.68352 4.13962 9.14371C4.46914 9.79383 4.90483 10.3957 5.42854 10.9287C5.15392 11.5546 5.00001 12.2514 5.00001 13V16C5.00001 17.6569 6.34316 19 8.00001 19V23Z" /></svg>
               </div>
               <button onClick={() => setShowOriginal(!showOriginal)} className="text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1 transition-all">
                   {showOriginal ? t('translate_quote') : t('original_quote')}
               </button>
          </div>
          <p className="text-xl font-medium text-gray-100 mb-4 leading-snug relative z-10 italic">"{displayQuote}"</p>
          <div className="relative z-10">
              <p className="text-base font-bold text-neon-blue">{displayAuthor}</p>
              <p className="text-sm text-gray-500">{displayTitle}</p>
          </div>
      </div>

    </section>
  );
};

export default ThePulse;
