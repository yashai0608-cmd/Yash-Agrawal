
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-black flex flex-col items-center justify-center font-sans">
      {/* Structural Minimalist Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }}></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-4 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
           <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">Professional Audit System 2.5</span>
        </div>

        <h1 className="text-7xl md:text-[90px] font-bold text-white tracking-tight mb-8 animate-in fade-in zoom-in-95 duration-1000 delay-200">
          Auditros <span className="brand-gradient-text">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-16 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          The cognitive workspace for modern auditors. Precise technical observations, automated standard verification, and verified search-grounded research.
        </p>

        <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
          <button 
            onClick={onStart}
            className="group relative px-12 py-5 bg-white rounded-2xl transition-all duration-300 hover:bg-cyan-400"
          >
            <span className="text-black font-bold text-[11px] uppercase tracking-widest flex items-center gap-4">
              Access Intelligence Hub
              <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </span>
          </button>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-1000">
          <LandingFeature 
            icon="fa-shield-check" 
            title="Standard Compliance" 
            desc="Deep integration with IFRS, Ind AS, and SAs for precise technical referencing." 
          />
          <LandingFeature 
            icon="fa-microchip" 
            title="Technical Synthesis" 
            desc="Summarize complex financial transactions into clear, report-ready audit observations." 
          />
          <LandingFeature 
            icon="fa-search-plus" 
            title="Real-time Research" 
            desc="Ground your queries with live SEBI, MCA, and Income Tax department notifications." 
          />
        </div>
      </div>

      <div className="absolute bottom-12 left-12 flex flex-col gap-1 opacity-20 text-white">
        <span className="text-[9px] font-bold uppercase tracking-widest">Enterprise Secured</span>
        <span className="text-[11px] font-medium">AES-256 Grounded Logic</span>
      </div>
    </div>
  );
};

const LandingFeature: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center group cursor-default">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:border-cyan-500/30 transition-all duration-500">
      <i className={`fas ${icon} text-gray-500 text-lg group-hover:text-cyan-400 transition-colors`}></i>
    </div>
    <h3 className="text-white font-bold text-[12px] uppercase tracking-widest mb-3">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed font-medium px-4">{desc}</p>
  </div>
);
