
import React, { useState, useRef, useEffect } from 'react';
import { Message, AuditDocument } from '../types.ts';

interface ChatInterfaceProps {
  messages: Message[];
  documents: AuditDocument[];
  onSendMessage: (content: string, type?: any, options?: any) => void;
  isProcessing: boolean;
  onOpenStandard: (name: string) => void;
  onUpload: (docs: any) => void;
  onRemoveDocument: (id: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, onSendMessage, isProcessing, documents, onUpload, onRemoveDocument 
}) => {
  const [input, setInput] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SAFE_FILE_TYPES = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'image/jpeg', 
    'image/png'
  ];
  const MAX_SIZE = 20 * 1024 * 1024;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isProcessing]);

  const validateAndUpload = (file: File) => {
    if (!SAFE_FILE_TYPES.includes(file.type)) {
      alert("Validation Error: Please upload supported document formats (PDF, Excel, Images).");
      return;
    }
    if (file.size > MAX_SIZE) {
      alert("Validation Error: File exceeds the 20MB professional processing limit.");
      return;
    }

    const newDoc = { 
      id: Date.now().toString(), 
      name: file.name, 
      type: file.type, 
      size: (file.size/1024).toFixed(1)+' KB', 
      uploadDate: new Date() 
    };
    onUpload((prev: any) => [...prev, newDoc]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input, thinkingMode ? 'thinking' : 'search');
    setInput('');
  };

  const renderStyledContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;
      
      const isHeader = line === line.toUpperCase() && line.length > 5 && !line.includes(':');
      if (isHeader) {
        return (
          <div key={i} className="audit-heading">
            {line}
          </div>
        );
      }

      // Detect bullet points
      if (trimmed.startsWith('1)') || trimmed.startsWith('2)') || trimmed.startsWith('3)') || trimmed.startsWith('4)') || trimmed.startsWith('5)') || trimmed.startsWith('6)')) {
        return (
          <div key={i} className="flex gap-3 mb-2 pl-4">
            <span className="text-cyan-500 font-bold shrink-0">{trimmed.split(' ')[0]}</span>
            <p className="text-[13.5px] text-gray-300 leading-relaxed font-medium">
              {trimmed.substring(trimmed.indexOf(' ') + 1)}
            </p>
          </div>
        );
      }

      return (
        <p key={i} className="text-[13.5px] text-gray-300 leading-relaxed mb-2.5 font-medium pl-4 border-l border-white/5">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`flex-1 flex flex-col h-full universe-bg relative ${isDragging ? 'bg-cyan-500/[0.02]' : ''}`} 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
      onDragLeave={() => setIsDragging(false)} 
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); Array.from(e.dataTransfer.files).forEach(validateAndUpload); }}>
      
      <div className="scanlines"></div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${msg.role === 'assistant' ? 'bg-white/5 border-white/10 text-cyan-400' : 'bg-cyan-600 border-cyan-500 text-white'}`}>
                <i className={`fas ${msg.role === 'assistant' ? 'fa-terminal' : 'fa-user'} text-[10px]`}></i>
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`w-full px-8 py-7 rounded-2xl glass-panel ${msg.role === 'user' ? 'bg-white/[0.04]' : ''}`}>
                  <div className="audit-data-render">{renderStyledContent(msg.content)}</div>
                </div>
                <span className="mt-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.role === 'assistant' ? 'Auditros Core' : 'Professional Input'}
                </span>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex gap-6 items-center">
              <div className="w-8 h-8 flex items-center justify-center text-cyan-400">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-[0.4em] animate-pulse">Running Technical Analysis Query...</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-6 bg-black/60 border-t border-white/[0.06] backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto">
          <form className="flex items-center gap-3" onSubmit={handleFormSubmit}>
            <button 
              type="button" 
              onClick={() => setThinkingMode(!thinkingMode)} 
              title="Toggle Deep Reasoning Mode"
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${thinkingMode ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.1)]' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}>
              <i className="fas fa-brain-circuit text-sm"></i>
            </button>
            
            <div className="flex-1 relative">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                className="w-full cyber-input rounded-xl py-3 px-5 text-[14px] font-medium" 
                placeholder="Enter audit requirement, section, or observation logic..." 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <i className="fas fa-paperclip text-sm"></i>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && validateAndUpload(e.target.files[0])} />
            </div>
            
            <button 
              disabled={isProcessing || !input.trim()}
              className="h-11 px-6 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:hover:bg-white">
              Execute
            </button>
          </form>

          {documents.length > 0 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 shrink-0">
                  <i className="fas fa-file-pdf text-[10px] text-red-400"></i>
                  <span className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{doc.name}</span>
                  <button onClick={() => onRemoveDocument(doc.id)} className="text-gray-600 hover:text-white"><i className="fas fa-times text-[9px]"></i></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
