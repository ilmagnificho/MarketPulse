
import React from 'react';
import ThePulse from './components/ThePulse';
import TheCrowd from './components/TheCrowd';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './types';

const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <header className="w-full py-8 px-6 flex items-center justify-between max-w-md mx-auto relative z-10">
        <div className="flex items-center gap-3">
            {/* Neon Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/20">
                <span className="text-white font-black text-xl italic">M</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white italic">
                Market <span className="text-neon-blue text-glow">Pulse</span>
            </h1>
        </div>
        
        <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-black/40 text-white border border-white/10 rounded-lg px-2 py-1 text-xs font-mono outline-none focus:border-neon-blue transition-colors appearance-none cursor-pointer"
        >
            <option value="en">EN</option>
            <option value="ko">KR</option>
            <option value="zh">CN</option>
            <option value="ja">JP</option>
            <option value="es">ES</option>
        </select>
    </header>
  );
};

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-purple/30 selection:text-white pb-20 relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-900/5 blur-[100px] rounded-full"></div>
            </div>

            <Header />
            
            <main className="relative z-10 flex flex-col gap-8 px-4 pb-12 w-full max-w-md mx-auto">
                <ThePulse />
                {/* TheOracle Removed as requested */}
                <TheCrowd />
            </main>
            
             <footer className="text-center text-gray-600 text-[10px] pb-8 font-mono tracking-widest uppercase">
                Market Pulse • v2.1.0 • Alpha
            </footer>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Dashboard />
    </LanguageProvider>
  );
};

export default App;