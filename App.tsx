
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { StandardModal } from './components/StandardModal';
import { Message, AuditDocument } from './types';
import { GeminiService, ModelType } from './geminiService';

declare const window: any;

const INITIAL_GREETING = "COMMAND SYSTEM ONLINE ----------------\nGROUNDING: ICAI, MCA, TAX PORTAL SECURE TUNNELS.\nSELECT MODULE TO INITIATE INTEL SCAN.";

const App: React.FC = () => {
  const [panelMessages, setPanelMessages] = useState<Record<string, Message[]>>({
    'Audit Observation': [{ id: 'init-1', role: 'assistant', content: INITIAL_GREETING, timestamp: new Date() }],
    'Audit Plan': [],
    'Accounting Standards': [],
    'Regulatory Updates': [],
    'Tax Compliance': []
  });

  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSection, setActiveSection] = useState('Audit Observation');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  
  const geminiRef = useRef(new GeminiService());

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasCustomKey(hasKey);
        } catch (e) {
          console.error("Key check error", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasCustomKey(true);
      const msg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "API KEY ROTATED ----------------\nPROFESSIONAL TIER ENGINE INITIALIZED. QUOTA LIMITS UPDATED.", 
        timestamp: new Date() 
      };
      setPanelMessages(prev => ({ ...prev, [activeSection]: [...(prev[activeSection] || []), msg] }));
    }
  };

  const handleSendMessage = async (content: string, type: ModelType = 'thinking', imageData?: { data: string; mimeType: string }) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setPanelMessages(prev => ({ ...prev, [activeSection]: [...(prev[activeSection] || []), userMsg] }));
    setIsProcessing(true);

    try {
      const history = (panelMessages[activeSection] || []).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const docContext = documents.map(doc => `[FILE: ${doc.name}]\n${doc.content || "Attached evidence source."}`).join('\n\n');
      
      let panelFocus = `[MODULE: ${activeSection.toUpperCase()}] `;
      const { text, sources } = await geminiRef.current.generateAuditResponse(`${panelFocus}\n${content}`, history, docContext, type, imageData);
      
      setPanelMessages(prev => ({
        ...prev,
        [activeSection]: [...(prev[activeSection] || []), { id: Date.now().toString(), role: 'assistant', content: text, timestamp: new Date(), sources }]
      }));
    } catch (error: any) {
      console.error(error);
      let errorMessage = "SYSTEM FAILURE: AN UNEXPECTED ERROR OCCURRED.";
      
      if (error.message === "QUOTA_EXHAUSTED" || error.message?.includes('429')) {
        errorMessage = "RESOURCE EXHAUSTED ----------------\nLIMIT: FREE TIER QUOTA REACHED.\nACTION: ROTATE TO A PAID API KEY TO CONTINUE HIGH-FREQUENCY AUDITING.\n[INFO: ai.google.dev/gemini-api/docs/billing]";
      }

      const errMsg: Message = { id: Date.now().toString(), role: 'assistant', content: errorMessage, timestamp: new Date() };
      setPanelMessages(prev => ({ ...prev, [activeSection]: [...(prev[activeSection] || []), errMsg] }));
    } finally { setIsProcessing(false); }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const onSectionSelect = (label: string) => {
    setActiveSection(label);
    if (!panelMessages[label]?.length) {
      setPanelMessages(prev => ({
        ...prev,
        [label]: [{ id: Date.now().toString(), role: 'assistant', content: `MODULE ${label.toUpperCase()} LOADED.`, timestamp: new Date() }]
      }));
    }
  };

  const handleUpload = (file: File) => {
    const newDoc: AuditDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: `${(file.size/1024).toFixed(1)}KB`,
      uploadDate: new Date()
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  return (
    <div className="flex h-screen w-full bg-[#020202] text-gray-400 overflow-hidden font-inter selection:bg-cyan-500/20">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        documents={documents} 
        activeSection={activeSection} 
        onSectionSelect={onSectionSelect} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-black/40 border-b border-white/[0.04] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <img src="logo.png" alt="Auditros AI" className="w-8 h-8 object-cover rounded-lg border border-white/10" />
            <h1 className="text-lg font-black tracking-tight gradient-text font-jakarta">Auditros AI</h1>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-cyan-500/5 border border-cyan-500/20">
              <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.2em]">{activeSection}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSelectKey}
              className={`px-3 py-1.5 rounded-lg border transition-all text-[9px] font-black uppercase tracking-widest ${hasCustomKey ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-gray-500 border-white/5 hover:border-cyan-500/30 hover:text-cyan-400'}`}
            >
               <i className={`fas ${hasCustomKey ? 'fa-bolt' : 'fa-key'} mr-2`}></i>
               {hasCustomKey ? 'Secure Key Active' : 'Upgrade Quota'}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <ChatInterface 
            messages={panelMessages[activeSection] || []} 
            documents={documents} 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing} 
            onOpenStandard={() => {}}
            onUpload={handleUpload}
            onRemoveDocument={removeDocument}
          />
        </div>
      </main>
      <StandardModal isOpen={false} onClose={() => {}} standard={null} />
    </div>
  );
};

export default App;
