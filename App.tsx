
import React from 'react';
import ThePulse from './components/ThePulse';
import TheCrowd from './components/TheCrowd';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './types';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <header className="w-full py-3 px-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 select-none group">
            <div className="relative">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]"></div>
                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter italic text-zinc-100">
              MARKET<span className="text-emerald-500">PULSE</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-black border border-zinc-800 text-zinc-400 text-[10px] font-mono rounded py-1 px-2 focus:outline-none focus:border-emerald-500 cursor-pointer uppercase hover:border-zinc-600 transition-colors"
            >
              <option value="en">ENG</option>
              <option value="ko">KOR</option>
              <option value="zh">CHN</option>
              <option value="ja">JPN</option>
              <option value="es">ESP</option>
            </select>
          </div>
        </div>
      </header>
  );
};

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-12 py-8 text-center border-t border-zinc-900 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
      <p className="text-zinc-600 text-[10px] font-mono mb-1 relative z-10">© {new Date().getFullYear()} {t('footer')}</p>
      <p className="text-zinc-800 text-[10px] uppercase tracking-widest relative z-10">{t('data_provider')}</p>
    </footer>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-emerald-500 selection:text-white flex flex-col font-sans overflow-x-hidden relative">
      {/* CRT Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      
      <Header />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-8 space-y-8 relative z-10">
        
        {/* A. The Pulse (Hero) */}
        <section id="the-pulse" className="animate-fade-in-down">
          <ThePulse />
        </section>

        {/* B. The Crowd (Community) */}
        <section id="the-crowd" className="animate-fade-in-up">
          <TheCrowd />
        </section>

      </main>

      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
