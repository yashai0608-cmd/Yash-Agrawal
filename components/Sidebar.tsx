
import React from 'react';
import { AuditDocument } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: AuditDocument[];
  activeSection: string;
  onSectionSelect: (label: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activeSection, onSectionSelect }) => {
  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) bg-black border-r border-white/[0.05] flex flex-col h-full z-20 relative shadow-[10px_0_40px_rgba(0,0,0,0.6)]`}>
      <div className="h-16 flex items-center justify-between px-6">
        {isOpen && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="w-1.5 h-4 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(0,242,254,0.5)]"></div>
            <span className="font-black text-[9px] tracking-[0.5em] text-gray-500 uppercase">Nexus Core</span>
          </div>
        )}
        <button 
          onClick={onToggle}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ${isOpen ? 'hover:bg-white/5 text-gray-500 hover:text-cyan-400' : 'mx-auto text-cyan-500 hover:scale-110'}`}
        >
          <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-compass'} text-[12px]`}></i>
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
        <SidebarItem icon="fa-fingerprint" label="Observation" isOpen={isOpen} active={activeSection === 'Audit Observation'} onClick={() => onSectionSelect('Audit Observation')} />
        <SidebarItem icon="fa-chess-king" label="Audit Plan" isOpen={isOpen} active={activeSection === 'Audit Plan'} onClick={() => onSectionSelect('Audit Plan')} />
        
        <div className="mt-10 pt-8 border-t border-white/[0.04]">
          {isOpen && (
             <span className="px-4 text-[8px] font-black text-gray-700 tracking-[0.4em] block mb-4 uppercase opacity-40 animate-in fade-in duration-700">
               Tactical Hub
             </span>
          )}
          <div className="space-y-1.5">
            <SidebarItem icon="fa-scale-balanced" label="Accounting" isOpen={isOpen} active={activeSection === 'Accounting Standards'} onClick={() => onSectionSelect('Accounting Standards')} />
            <SidebarItem icon="fa-bolt-lightning" label="Regulatory" isOpen={isOpen} active={activeSection === 'Regulatory Updates'} onClick={() => onSectionSelect('Regulatory Updates')} />
            <SidebarItem icon="fa-file-invoice-dollar" label="Tax Compliance" isOpen={isOpen} active={activeSection === 'Tax Compliance'} onClick={() => onSectionSelect('Tax Compliance')} />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/[0.05] bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/5">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl border border-cyan-500/20 flex items-center justify-center bg-black text-cyan-500 group-hover:border-cyan-500 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.2)] transition-all shadow-inner">
               <i className="fas fa-shield-halved text-[12px]"></i>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black"></div>
          </div>
          {isOpen && (
            <div className="min-w-0 animate-in fade-in duration-500">
              <p className="text-[11px] font-bold text-gray-300 truncate tracking-tight">Lead Auditor</p>
              <p className="text-[7px] text-cyan-500/60 font-black uppercase tracking-[0.2em]">Strategist Tier</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: string; label: string; isOpen: boolean; active?: boolean; onClick: () => void }> = ({ icon, label, isOpen, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center h-11 px-4 rounded-xl transition-all duration-500 relative group
      ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_4px_12px_rgba(0,242,254,0.05)]' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'}
    `}
  >
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-500 ${active ? 'text-cyan-400 scale-110 shadow-[0_0_10px_rgba(0,242,254,0.2)]' : 'group-hover:scale-110'}`}>
      <i className={`fas ${icon} text-[13px]`}></i>
    </div>
    {isOpen && <span className={`ml-4 text-[12px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-200'}`}>{label}</span>}
    {active && (
      <>
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f2fe]"></div>
        <div className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_15px_#00f2fe] animate-in slide-in-from-left-full"></div>
      </>
    )}
  </button>
);
