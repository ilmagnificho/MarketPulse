import React from 'react';
import ThePulse from './components/ThePulse';
import TheCrowd from './components/TheCrowd';
import TheOracle from './components/TheOracle';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './types';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <header className="w-full py-6 px-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              MARKET <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">PULSE</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded py-1 px-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="es">Español</option>
            </select>
            <a href="#" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors hidden sm:block">
              {t('about')}
            </a>
          </div>
        </div>
      </header>
  );
};

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-20 py-8 text-center text-slate-600 text-sm">
      <p>© {new Date().getFullYear()} {t('footer')}</p>
      <p className="mt-2 opacity-50">{t('data_provider')}</p>
    </footer>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      <Header />

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        
        {/* A. The Pulse (Hero) */}
        <section id="the-pulse">
          <ThePulse />
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* B. The Crowd (Community) */}
        <section id="the-crowd">
          <TheCrowd />
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* C. The Oracle (Game) */}
        <section id="the-oracle">
          <TheOracle />
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
