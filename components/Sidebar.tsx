
import React from 'react';
import { ChatSession } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: (section: string) => void;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  sessions, 
  activeSessionId, 
  onNewChat, 
  onSwitchChat, 
  onDeleteChat
}) => {
  return (
    <div className={`${isOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-black border-r border-white/[0.06] flex flex-col h-full z-20 relative shadow-2xl`}>
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/[0.04]">
        {isOpen && (
          <div className="flex items-center gap-3">
            <span className="font-bold text-[10px] tracking-[0.3em] text-gray-500 uppercase">Archive</span>
          </div>
        )}
        <button 
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white transition-colors"
        >
          <i className={`fas ${isOpen ? 'fa-indent' : 'fa-outdent'} text-sm`}></i>
        </button>
      </div>

      <div className="px-4 py-6">
        <button 
          onClick={() => onNewChat('Audit Observation')}
          className={`w-full h-10 flex items-center gap-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all group overflow-hidden ${!isOpen && 'justify-center'}`}
        >
          <i className="fas fa-plus text-[10px] text-white"></i>
          {isOpen && <span className="text-[10px] font-bold uppercase tracking-widest text-white">New Project</span>}
        </button>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar pb-8">
        <div>
          {isOpen && (
            <span className="px-3 text-[9px] font-bold text-gray-600 tracking-widest block mb-4 uppercase">Recent Analysis</span>
          )}
          <div className="space-y-1">
            {sessions.map(session => (
              <div key={session.id} className="group relative">
                <button 
                  onClick={() => onSwitchChat(session.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${activeSessionId === session.id ? 'bg-white/[0.06] border-white/10' : 'border-transparent hover:bg-white/[0.02]'}`}
                >
                  <i className={`fas ${getIconForSection(session.section)} text-[10px] ${activeSessionId === session.id ? 'text-cyan-400' : 'text-gray-600'}`}></i>
                  {isOpen && (
                    <span className={`text-[12px] font-medium truncate flex-1 text-left ${activeSessionId === session.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {session.title}
                    </span>
                  )}
                </button>
                {isOpen && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg text-gray-700 hover:text-red-500 transition-all"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {isOpen && (
             <span className="px-3 text-[9px] font-bold text-gray-600 tracking-widest block mb-4 uppercase">Specialized Modules</span>
          )}
          <div className="space-y-1">
            <SidebarModuleItem icon="fa-magnifying-glass-chart" label="Observations" isOpen={isOpen} onClick={() => onNewChat('Audit Observation')} />
            <SidebarModuleItem icon="fa-clipboard-list" label="Audit Planning" isOpen={isOpen} onClick={() => onNewChat('Audit Plan')} />
            <SidebarModuleItem icon="fa-book-open" label="Accounting Stds" isOpen={isOpen} onClick={() => onNewChat('Accounting Standards')} />
            <SidebarModuleItem icon="fa-gavel" label="Regulatory Hub" isOpen={isOpen} onClick={() => onNewChat('Regulatory Updates')} />
            <SidebarModuleItem icon="fa-calculator" label="Tax & Statutary" isOpen={isOpen} onClick={() => onNewChat('Tax Compliance')} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/[0.01] border-t border-white/[0.04]">
        <div className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-cyan-400">
             <i className="fas fa-user-tie text-base"></i>
          </div>
          {isOpen && (
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-200 truncate">Senior Auditor</p>
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Internal Lead</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getIconForSection = (section: string) => {
  switch (section) {
    case 'Audit Observation': return 'fa-magnifying-glass-chart';
    case 'Audit Plan': return 'fa-clipboard-list';
    case 'Accounting Standards': return 'fa-book-open';
    case 'Regulatory Updates': return 'fa-gavel';
    case 'Tax Compliance': return 'fa-calculator';
    default: return 'fa-clock-rotate-left';
  }
};

const SidebarModuleItem: React.FC<{ icon: string; label: string; isOpen: boolean; onClick: () => void }> = ({ icon, label, isOpen, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center h-10 px-3 rounded-xl transition-all text-gray-600 hover:text-gray-300 hover:bg-white/[0.02] group"
  >
    <div className="w-6 h-6 flex items-center justify-center">
      <i className={`fas ${icon} text-[12px] group-hover:scale-110 transition-transform`}></i>
    </div>
    {isOpen && <span className="ml-4 text-[12px] font-medium whitespace-nowrap">{label}</span>}
  </button>
);
