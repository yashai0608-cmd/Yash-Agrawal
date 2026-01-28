
import React, { useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { UserRegistryStore } from '../storageService';

export const CommandRoster: React.FC = () => {
  const [roster, setRoster] = useState<AuthUser[]>([]);

  useEffect(() => {
    const data = UserRegistryStore.getRegistry();
    setRoster(data.sort((a, b) => b.lastLogin - a.lastLogin));
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full universe-bg relative animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="scanlines"></div>
      
      <div className="flex-1 overflow-y-auto px-10 py-12 space-y-10 no-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header HUD */}
          <div className="mb-12 flex items-center justify-between border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe]"></div>
                <h2 className="text-2xl font-black text-white font-jakarta tracking-tight">Personnel Intelligence Roster</h2>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em]">Central Command User Telemetry System</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono text-cyan-500/80 font-bold">{roster.length}</span>
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Identities Registered</p>
            </div>
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-1 gap-4">
            {roster.length === 0 ? (
              <div className="py-20 text-center glass-panel rounded-3xl border border-white/5">
                <i className="fas fa-user-secret text-gray-800 text-5xl mb-4"></i>
                <p className="text-gray-600 font-bold tracking-widest uppercase text-[10px]">No Identified Personnel Found in Central Uplink</p>
              </div>
            ) : (
              roster.map((person) => (
                <div key={person.id} className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-white/5 hover:border-cyan-500/20 transition-all duration-500 group">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img 
                        src={person.picture} 
                        className="w-14 h-14 rounded-xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform" 
                        alt={person.name} 
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-lg bg-green-500 border-4 border-[#0a0a0a] flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold tracking-tight text-lg group-hover:text-cyan-400 transition-colors">{person.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-gray-500">{person.email}</span>
                        <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                        <span className="text-[9px] font-black text-cyan-500/40 uppercase tracking-widest">Auditor ID: {person.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Last Secure Login</span>
                      <span className="text-xs font-mono text-gray-400">{new Date(person.lastLogin).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black text-cyan-400 uppercase tracking-widest">Active Access</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Developer Notes Footer */}
          <div className="mt-20 p-8 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fas fa-terminal text-6xl text-cyan-500"></i>
             </div>
             <h4 className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Uplink Telemetry Status</h4>
             <p className="text-gray-400 text-[12px] leading-relaxed max-w-2xl">
                This Command Roster serves as the in-house portal for identity monitoring. It synchronizes all user metadata captured during Google Authentication. Auditors can continue to operate anonymously, but verified identities are cataloged here for developer audit trails and future tier-based permissions.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
