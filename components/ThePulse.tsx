
import React, { useEffect, useState } from 'react';
import { FearGreedData, SentimentConfig, SentimentLevel } from '../types';
import { api } from '../services/mockSupabase';
import { useLanguage } from '../contexts/LanguageContext';

const SENTIMENT_CONFIGS: Record<string, SentimentConfig> = {
  [SentimentLevel.ExtremeFear]: {
    level: SentimentLevel.ExtremeFear,
    emoji: '😭',
    bgColor: 'bg-red-700',
    textColor: 'text-red-100',
    messageKey: 'pulse_extreme_fear',
    range: [0, 20]
  },
  [SentimentLevel.Fear]: {
    level: SentimentLevel.Fear,
    emoji: '😥',
    bgColor: 'bg-red-500',
    textColor: 'text-red-50',
    messageKey: 'pulse_fear',
    range: [21, 40]
  },
  [SentimentLevel.Neutral]: {
    level: SentimentLevel.Neutral,
    emoji: '😐',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    messageKey: 'pulse_neutral',
    range: [41, 60]
  },
  [SentimentLevel.Greed]: {
    level: SentimentLevel.Greed,
    emoji: '🤑',
    bgColor: 'bg-green-500',
    textColor: 'text-green-900',
    messageKey: 'pulse_greed',
    range: [61, 80]
  },
  [SentimentLevel.ExtremeGreed]: {
    level: SentimentLevel.ExtremeGreed,
    emoji: '😈',
    bgColor: 'bg-green-700',
    textColor: 'text-green-100',
    messageKey: 'pulse_extreme_greed',
    range: [81, 100]
  },
};

const ThePulse: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
      <div className="w-full h-96 rounded-3xl animate-pulse bg-slate-800 flex items-center justify-center shadow-xl">
        <span className="text-slate-500 font-bold text-xl flex flex-col items-center gap-4">
           <span className="block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
           {t('syncing')}
        </span>
      </div>
    );
  }

  if (!data) return null;

  const config = SENTIMENT_CONFIGS[data.level] || SENTIMENT_CONFIGS[SentimentLevel.Neutral];

  return (
    <section className={`w-full rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 ease-in-out ${config.bgColor}`}>
      <div className="p-8 md:p-16 flex flex-col items-center text-center space-y-6">
        
        <div className="animate-bounce text-8xl md:text-9xl filter drop-shadow-lg select-none transform hover:scale-110 transition-transform duration-300 cursor-default">
          {config.emoji}
        </div>

        <div className="space-y-2">
          <h2 className={`text-6xl md:text-9xl font-black tracking-tighter ${config.textColor}`}>
            {data.value}
          </h2>
          <h3 className={`text-2xl md:text-4xl font-bold uppercase tracking-widest opacity-90 ${config.textColor}`}>
            {data.level}
          </h3>
        </div>

        <div className={`max-w-xl text-lg md:text-2xl font-medium p-6 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10 shadow-inner ${config.textColor}`}>
          {t(config.messageKey)}
        </div>
        
        <div className={`text-sm opacity-75 font-mono mt-4 ${config.textColor}`}>
          {t('last_updated')}: {new Date(data.timestamp).toLocaleDateString()}
        </div>
      </div>
      
      {/* Progress Bar Visual */}
      <div className="w-full h-6 bg-black/20">
        <div 
          className="h-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out relative"
          style={{ width: `${data.value}%` }}
        >
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default ThePulse;
