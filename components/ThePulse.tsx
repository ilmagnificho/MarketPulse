
import React, { useEffect, useState, useRef, TouchEvent } from 'react';
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

// Helper to create SVG Arcs
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

// CNN-Style Semi-Circle Speedometer
const NeonSpeedometer: React.FC<{ value: number, config: SentimentConfig }> = ({ value, config }) => {
    const radius = 140;
    const stroke = 25;
    const cx = 160;
    const cy = 160; // Bottom center

    // Segment Angles
    const segments = [
        { color: "#f43f5e", start: 0, end: 24, glow: "rgba(244,63,94,0.4)" },    // Extreme Fear
        { color: "#f97316", start: 25, end: 44, glow: "rgba(249,115,22,0.4)" },   // Fear
        { color: "#facc15", start: 45, end: 55, glow: "rgba(250,204,21,0.4)" },   // Neutral
        { color: "#10b981", start: 56, end: 75, glow: "rgba(16,185,129,0.4)" },   // Greed
        { color: "#34d399", start: 76, end: 100, glow: "rgba(52,211,153,0.4)" }   // Extreme Greed
    ];

    const rotation = (value / 100) * 180;

    return (
        <div className="relative flex flex-col items-center justify-center pt-8 pb-0 overflow-hidden">
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-20 blur-[80px] rounded-t-full pointer-events-none transition-colors duration-1000 ${config.color.split(' ')[0].replace('text-', 'bg-')}`}></div>

            <svg width="320" height="180" viewBox="0 0 320 180" className="relative z-10 overflow-visible">
                <defs>
                    <filter id="glow-segment">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {segments.map((seg, i) => {
                    const gap = i === 0 ? 0 : 1; 
                    const sAngle = (seg.start / 100) * 180 + gap;
                    const eAngle = (seg.end / 100) * 180 - gap;
                    const isActive = value >= seg.start; 
                    
                    return (
                        <path
                            key={i}
                            d={describeArc(cx, cy, radius, sAngle, eAngle)}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={stroke}
                            strokeLinecap="butt"
                            className="transition-opacity duration-500"
                            style={{ 
                                opacity: isActive ? 1 : 0.2, 
                                filter: isActive ? `drop-shadow(0 0 8px ${seg.glow})` : 'none' 
                            }}
                        />
                    );
                })}

                <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                    <line x1={cx} y1={cy} x2={cx - 120} y2={cy} stroke="white" strokeWidth="4" strokeLinecap="round" className="drop-shadow-md" />
                    <circle cx={cx} cy={cy} r="8" fill="white" />
                </g>
            </svg>

            <div className="relative z-20 -mt-16 flex flex-col items-center">
                <div className={`text-6xl font-black tracking-tighter text-glow-lg ${config.color}`}>
                    {Math.round(value)}
                </div>
                <div className={`text-lg font-bold uppercase tracking-widest mt-1 ${config.color}`}>
                    {config.level}
                </div>
            </div>
        </div>
    );
};

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
                </div>
            </div>
            <div className="text-right">
                <span className={`text-base font-mono font-bold ${colorClass} text-glow`}>
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
  
  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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

  const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (diff > threshold) {
          // Swipe Left -> Next (Circular: 0->1->2->0)
          setActiveSlide(prev => (prev + 1) % 3);
      } else if (diff < -threshold) {
          // Swipe Right -> Prev (Circular: 0->2->1->0)
          setActiveSlide(prev => (prev === 0 ? 2 : prev - 1));
      }
      
      touchStartX.current = 0;
      touchEndX.current = 0;
  };

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

  const displayQuote = showOriginal ? TRANSLATIONS['en'][quoteK] : t(quoteK);
  const displayAuthor = showOriginal ? TRANSLATIONS['en'][authorK] : t(authorK);
  const displayTitle = showOriginal ? TRANSLATIONS['en'][titleK] : t(titleK);

  const lastUpdated = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const lastUpdatedDate = new Date(data.timestamp).toLocaleDateString();

  return (
    <section className="w-full max-w-md mx-auto space-y-6">
      
      {/* Swipeable Carousel Card */}
      <div 
          className="app-card relative overflow-hidden flex flex-col min-h-[420px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
      >
         {/* Common Header (Static) */}
         <div className="p-6 pb-2 relative z-10 flex justify-between items-start">
             <div>
                <span className="text-neon-purple font-bold text-xs uppercase tracking-widest border border-neon-purple/30 px-2 py-1 rounded bg-neon-purple/10">
                    {activeSlide === 0 ? t('market_sentiment') : activeSlide === 1 ? t('historical_data') : t('pattern_title')}
                </span>
                <h2 className="text-3xl font-black text-white mt-3 tracking-tight leading-none">
                    {activeSlide === 0 ? "Fear & Greed" : activeSlide === 1 ? "Timeline" : "Patterns"}
                </h2>
             </div>
             <div className="text-right">
                 <span className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider">{t('last_updated')}</span>
                 <span className="block text-xs font-bold text-gray-300">{lastUpdatedDate}</span>
                 <span className="block text-xs font-bold text-gray-300">{lastUpdated}</span>
             </div>
         </div>

         {/* Sliding Container */}
         <div 
            className="flex-1 flex transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
         >
             
             {/* SLIDE 1: Gauge */}
             <div className="w-full flex-shrink-0 flex flex-col">
                <NeonSpeedometer value={data.value} config={config} />
                <div className="px-6 pb-8 text-center relative z-10">
                    <p className="text-gray-200 text-base font-medium leading-relaxed border-t border-white/10 pt-6">
                        {t(config.messageKey)}
                    </p>
                </div>
             </div>

             {/* SLIDE 2: Timeline */}
             <div className="w-full flex-shrink-0 px-0 py-2">
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
             </div>

             {/* SLIDE 3: Patterns */}
             <div className="w-full flex-shrink-0 p-5">
                <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                    <div className="grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 px-2 border-b border-white/10 pb-2">
                        <div>{t('col_date')}</div>
                        <div className="text-center">{t('col_score')}</div>
                        <div className="text-right">{t('col_return')}</div>
                    </div>

                    <div className="space-y-2">
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
         </div>

         {/* Dots Indicator */}
         <div className="flex justify-center gap-2 pb-6 pt-2">
            {[0, 1, 2].map(idx => (
                <button 
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSlide === idx ? 'bg-neon-blue w-6' : 'bg-gray-600 hover:bg-gray-500'}`}
                />
            ))}
         </div>
      </div>

      {/* Quote Card (Static below carousel) */}
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
