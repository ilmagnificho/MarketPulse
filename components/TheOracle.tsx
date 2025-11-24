import React, { useState, useEffect } from 'react';
import { api } from '../services/mockSupabase';
import { LeaderboardEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TheOracle: React.FC = () => {
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [prediction, setPrediction] = useState<string>('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getLeaderboard().then(setLeaders);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !prediction) return;
    
    await api.submitPrediction(name, parseFloat(prediction));
    setSubmitted(true);
  };

  return (
    <div className="w-full">
      <h2 className="text-sm font-bold text-neon-purple mb-4 px-2 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse shadow-[0_0_8px_#a855f7]"></span>
            {t('oracle_title')}
      </h2>

      <div className="app-card p-6 overflow-hidden relative group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-8 leading-relaxed border-l-2 border-neon-purple/50 pl-4">
            {t('oracle_desc')}
          </p>

          <div className="space-y-8">
            
            {/* Form Section */}
            <div className="space-y-6">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neon-purple mb-2">{t('your_handle')}</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-neon-purple focus:border-neon-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none transition-all placeholder-gray-600"
                      placeholder="e.g., Nostradamus"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neon-purple mb-2">{t('price_prediction')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm font-mono focus:ring-1 focus:ring-neon-purple focus:border-neon-purple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none transition-all placeholder-gray-600"
                        placeholder="4250.00"
                        value={prediction}
                        onChange={(e) => setPrediction(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-neon-purple to-indigo-600 text-white font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:brightness-110 active:scale-95 transition-all border border-white/10"
                  >
                    {t('cast_vision')}
                  </button>
                </form>
              ) : (
                <div className="text-center p-8 bg-neon-purple/10 rounded-2xl border border-neon-purple/20 animate-fade-in">
                  <span className="text-4xl block mb-4">🔮</span>
                  <h3 className="text-lg font-bold text-white mb-2">{t('prophecy_recorded')}</h3>
                  <p className="text-indigo-200 text-xs mb-6">{t('prophecy_desc')}</p>
                  <button 
                    onClick={() => setSubmitted(false)} 
                    className="text-xs font-bold text-neon-purple hover:text-white underline decoration-neon-purple/50 underline-offset-4"
                  >
                    {t('predict_again')}
                  </button>
                </div>
              )}
            </div>

            {/* Leaderboard Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-yellow-400 text-base">🏆</span> {t('top_prophets')}
              </h3>
              <div className="space-y-2">
                {leaders.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner
                        ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                          entry.rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' : 
                          'bg-orange-700/20 text-orange-400 border border-orange-700/30'}
                      `}>
                        {entry.rank}
                      </div>
                      <span className="font-bold text-sm text-gray-200">{entry.nickname}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-neon-blue drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]">${entry.prediction.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{entry.accuracy} {t('acc')}</div>
                    </div>
                  </div>
                ))}
                {leaders.length === 0 && (
                   <div className="text-center py-4 text-xs text-gray-600 font-mono">
                       Waiting for data...
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TheOracle;