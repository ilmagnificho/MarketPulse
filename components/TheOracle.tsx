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
    <div className="w-full bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-2xl border border-indigo-500/30 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-2">
            🔮 {t('oracle_title')}
          </h2>
          <p className="text-indigo-200/70 text-sm md:text-base">
            {t('oracle_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          {/* Form Section */}
          <div className="space-y-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">{t('your_handle')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g., Nostradamus"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">{t('price_prediction')}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-lg px-4 py-3 text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="4250.00"
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5"
                >
                  {t('cast_vision')}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 bg-indigo-900/30 rounded-xl border border-indigo-500/30 animate-fade-in">
                <span className="text-4xl block mb-2">✨</span>
                <h3 className="text-xl font-bold text-white">{t('prophecy_recorded')}</h3>
                <p className="text-indigo-300 text-sm mt-2">{t('prophecy_desc')}</p>
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="mt-4 text-xs text-indigo-400 hover:text-white underline"
                >
                  {t('predict_again')}
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="bg-slate-900/40 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-400">🏆</span> {t('top_prophets')}
            </h3>
            <div className="space-y-3">
              {leaders.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${entry.rank === 1 ? 'bg-yellow-500 text-yellow-900' : 
                        entry.rank === 2 ? 'bg-slate-400 text-slate-900' : 
                        'bg-orange-700 text-orange-100'}
                    `}>
                      #{entry.rank}
                    </div>
                    <span className="font-semibold text-indigo-100">{entry.nickname}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-white">${entry.prediction.toFixed(2)}</div>
                    <div className="text-xs text-green-400">{entry.accuracy} {t('acc')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TheOracle;
