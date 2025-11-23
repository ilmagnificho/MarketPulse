
import React from 'react';
import ThePulse from './components/ThePulse';
import TheCrowd from './components/TheCrowd';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './types';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <header className="w-full py-4 px-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter italic">
              MARKET<span className="text-blue-500">PULSE</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-black border border-slate-700 text-slate-300 text-xs font-mono rounded py-1.5 px-2 focus:outline-none focus:border-blue-500 cursor-pointer uppercase hover:border-slate-500 transition-colors"
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
    <footer className="mt-12 py-8 text-center border-t border-slate-900 bg-black">
      <p className="text-slate-600 text-xs font-mono mb-1">© {new Date().getFullYear()} {t('footer')}</p>
      <p className="text-slate-800 text-[10px] uppercase tracking-widest">{t('data_provider')}</p>
    </footer>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-blue-500 selection:text-white flex flex-col font-sans">
      <Header />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-10 space-y-8 md:space-y-12">
        
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
