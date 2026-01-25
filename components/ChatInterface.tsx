
import React, { useState, useRef, useEffect } from 'react';
import { Message, AuditDocument } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  documents: AuditDocument[];
  onSendMessage: (content: string, type?: any, imageData?: any) => void;
  isProcessing: boolean;
  onOpenStandard: (name: string) => void;
  onUpload: (file: File) => void;
  onRemoveDocument: (id: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  documents, 
  onUpload, 
  onRemoveDocument 
}) => {
  const [input, setInput] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => onUpload(file));
  };

  const renderStyledContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      
      const isHeader = line.includes('---') || (line === line.toUpperCase() && line.length > 5);
      const isLabel = line.includes(':') && line.indexOf(':') < 25;

      if (isHeader) {
        return (
          <div key={i} className="mt-6 mb-3 flex items-center gap-4">
             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_#00f2fe]"></div>
             <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{line.replace(/-/g, '').trim()}</h4>
             <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
          </div>
        );
      }

      if (isLabel) {
        const [label, ...val] = line.split(':');
        return (
          <div key={i} className="flex gap-4 mb-1 px-2 py-1 rounded-md transition-all hover:bg-cyan-500/5 group">
             <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest w-32 shrink-0 pt-1 group-hover:text-cyan-400/80 transition-colors">{label.trim()}</span>
             <span className="text-[13px] text-gray-300 font-medium leading-relaxed tracking-tight">{val.join(':').trim()}</span>
          </div>
        );
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        return (
          <div key={i} className="flex gap-4 mb-1.5 pl-3 group border-l border-white/5 hover:border-cyan-500/30 transition-all">
            <span className="text-cyan-500/60 font-black text-[10px] pt-0.5">0{i+1}</span>
            <p className="text-[13px] text-gray-400 group-hover:text-gray-100 transition-colors leading-relaxed">{trimmed.substring(1).trim()}</p>
          </div>
        );
      }

      return <p key={i} className="text-[13px] text-gray-400/90 leading-relaxed mb-2 tracking-tight pl-2 border-l border-transparent hover:border-white/10 transition-all">{line}</p>;
    });
  };

  return (
    <div 
      className={`flex-1 flex flex-col h-full universe-bg relative transition-all duration-700 ${isDragging ? 'scale-[0.99] grayscale-[0.5]' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="scanlines"></div>

      {/* Drag Overlay HUD */}
      {isDragging && (
        <div className="absolute inset-4 z-50 flex items-center justify-center bg-cyan-500/5 backdrop-blur-md pointer-events-none border border-cyan-500/40 rounded-3xl animate-pulse overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-50"></div>
          <div className="text-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,254,0.3)]">
               <i className="fas fa-satellite-dish text-cyan-400 text-3xl animate-bounce"></i>
            </div>
            <p className="text-cyan-400 font-black uppercase tracking-[0.6em] text-lg mb-2">Initialize Uplink</p>
            <p className="text-cyan-400/60 text-[11px] font-bold uppercase tracking-widest">Transmit evidence for real-time audit synthesis</p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-10 no-scrollbar relative z-10">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex gap-6 mb-10 message-entrance ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 ${msg.role === 'assistant' ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.2)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <i className={`fas ${msg.role === 'assistant' ? 'fa-microchip' : 'fa-id-badge'} text-[11px]`}></i>
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`w-full px-7 py-6 rounded-2xl data-plate ${msg.role === 'user' ? 'bg-white/[0.03] border border-white/10 backdrop-blur-3xl' : 'glass-panel'}`}>
                  <div className="flex items-center justify-between mb-5 opacity-40">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'assistant' ? 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]' : 'bg-white/50'}`}></div>
                      <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">{msg.role} tactical feed</span>
                    </div>
                    <span className="text-[8px] font-mono tracking-widest uppercase opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                  </div>
                  <div className="audit-data-render">
                    {renderStyledContent(msg.content)}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[8px] font-black text-cyan-400/60 uppercase tracking-[0.4em]">External Validations</span>
                        <div className="flex-1 h-[1px] bg-cyan-500/10"></div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {msg.sources.map((src, si) => (
                          <a key={si} href={src.uri} target="_blank" className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all duration-300 text-[10px] text-gray-400 hover:text-white font-bold tracking-tight flex items-center gap-3 group/link shadow-sm">
                            <i className="fas fa-external-link-alt text-[8px] group-hover/link:rotate-12 transition-transform"></i>
                            <span className="truncate max-w-[180px] uppercase">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-6 message-entrance">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-xl border border-cyan-400 animate-ping opacity-20"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_#00f2fe]"></div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <p className="text-[10px] font-black text-cyan-400/80 uppercase tracking-[0.6em] animate-pulse">Synchronizing Intelligence Nodes...</p>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500/40 animate-[loading_2s_infinite_linear]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-6 bg-black/40 border-t border-white/5 backdrop-blur-3xl relative z-10">
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
        <div className="max-w-4xl mx-auto flex flex-col gap-5">
          
          {/* Active Context HUD */}
          {documents.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {documents.map(doc => (
                <div key={doc.id} className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/40 transition-all shrink-0 animate-in zoom-in-95 duration-500">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <i className="fas fa-microchip text-cyan-400 text-[10px]"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-200 truncate max-w-[140px] tracking-tight">{doc.name}</span>
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{doc.size}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveDocument(doc.id)}
                    className="w-5 h-5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 text-gray-700 rounded-lg transition-all"
                  >
                    <i className="fas fa-times text-[9px]"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <form className="relative flex items-center gap-3" onSubmit={(e) => { e.preventDefault(); if(input.trim()) onSendMessage(input, thinkingMode ? 'thinking' : 'search'); setInput(''); }}>
            <button 
              type="button"
              onClick={() => setThinkingMode(!thinkingMode)}
              className={`w-11 h-11 rounded-xl border transition-all duration-500 flex items-center justify-center group ${thinkingMode ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.15)] active-glow' : 'bg-white/5 border-white/10 text-gray-600 hover:border-white/20'}`}
              title="Activate Deep Analysis Neural Core"
            >
              <i className={`fas fa-brain text-[14px] ${thinkingMode ? 'animate-pulse' : 'group-hover:scale-110'}`}></i>
            </button>
            <div className="flex-1 relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full cyber-input rounded-xl py-3.5 px-6 text-[14px] outline-none font-medium placeholder:text-gray-700 shadow-2xl transition-all"
                placeholder="Inject technical directive or drop files to analyze..."
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30">
                <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">Input Active</span>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <button className="w-11 h-11 rounded-xl bg-cyan-600 flex items-center justify-center hover:bg-cyan-400 transition-all active:scale-90 text-white shadow-xl group">
              <i className="fas fa-arrow-up text-[12px] group-hover:-translate-y-0.5 transition-transform"></i>
            </button>
          </form>

          <div className="flex items-center justify-between px-2 pt-1">
             <div className="flex items-center gap-8">
               <div className="flex items-center gap-3 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] group cursor-default">
                  <i className="fas fa-circle-nodes text-cyan-500/30 group-hover:text-cyan-500 transition-colors"></i>
                  <span className="group-hover:text-gray-500 transition-colors">Endpoint: Encrypted</span>
               </div>
               <div className="flex items-center gap-3 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] group cursor-default">
                  <i className="fas fa-shield-check text-cyan-500/30 group-hover:text-cyan-500 transition-colors"></i>
                  <span className="group-hover:text-gray-500 transition-colors">Trust-Layer: Verified</span>
               </div>
             </div>
             {documents.length > 0 && (
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/10">
                 <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                 <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em]">
                   {documents.length} Core Assets Loaded
                 </span>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
