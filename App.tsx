
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatInterface } from './components/ChatInterface.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Message, AuditDocument, ChatSession } from './types.ts';
import { GeminiService, ModelType } from './geminiService.ts';
import { ChatHistoryStore, AuditExperienceStore } from './storageService.ts';

const INITIAL_GREETING = "AUDITROS INTELLIGENCE NODE CONNECTED\nSTATUS: OPERATIONAL\nGROUNDING: ICAI, MCA, TAX PORTAL ACTIVE CHANNELS\n\nSELECT A MODULE FROM THE SIDEBAR TO INITIATE TECHNICAL ANALYSIS.";

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const geminiRef = useRef(new GeminiService());

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  useEffect(() => {
    const history = ChatHistoryStore.getAll();
    if (history.length > 0) {
      setSessions(history);
      setActiveSessionId(history[0].id);
    } else {
      handleNewChat('Audit Observation');
    }
  }, []);

  const initiateSystemHandshake = () => {
    setShowLanding(false);
  };

  const handleNewChat = (section: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `${section} Analysis`,
      section: section,
      messages: [{ id: 'init-' + Date.now(), role: 'assistant', content: INITIAL_GREETING, timestamp: new Date() }],
      lastUpdate: Date.now()
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    ChatHistoryStore.saveSession(newSession);
  };

  const handleSendMessage = async (content: string, type: ModelType = 'thinking', options?: any) => {
    if (!activeSession) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    let updatedTitle = activeSession.title;
    if (activeSession.messages.length <= 1) {
      updatedTitle = content.length > 30 ? content.substring(0, 27) + '...' : content;
    }

    const updatedSession: ChatSession = {
      ...activeSession,
      title: updatedTitle,
      messages: [...activeSession.messages, userMsg],
      lastUpdate: Date.now()
    };

    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setIsProcessing(true);

    try {
      const history = updatedSession.messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      }));
      const docContext = documents.map(doc => `[FILE: ${doc.name}]\n${doc.content || "Attached evidence source."}`).join('\n\n');
      
      let response;
      if (type === 'video') {
        response = await geminiRef.current.generateVideo(content, { image: options?.imageData });
      } else if (type === 'image') {
        response = await geminiRef.current.generateImage(content, options);
      } else {
        response = await geminiRef.current.generateAuditResponse(
          content, history, docContext, type, activeSession.section, options?.imageData
        );
      }
      
      const assistantMsg: Message = { id: Date.now().toString(), role: 'assistant', content: response.text, timestamp: new Date(), sources: response.sources };
      const finalSession = { ...updatedSession, messages: [...updatedSession.messages, assistantMsg], lastUpdate: Date.now() };
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
      ChatHistoryStore.saveSession(finalSession);

      if (type !== 'video' && type !== 'image') {
        setTimeout(async () => {
          const learning = await geminiRef.current.extractLearning(activeSession.section, content, response.text);
          if (learning) AuditExperienceStore.saveExperience(learning);
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = "SERVICE UNAVAILABLE: AN UNEXPECTED ERROR OCCURRED DURING PROCESSING.";
      const errAssistantMsg: Message = { id: Date.now().toString(), role: 'assistant', content: errorMessage, timestamp: new Date() };
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? { ...updatedSession, messages: [...updatedSession.messages, errAssistantMsg] } : s));
    } finally { 
      setIsProcessing(false); 
    }
  };

  if (showLanding) return <LandingPage onStart={initiateSystemHandshake} />;

  return (
    <div className="flex h-screen w-full bg-[#030303] text-[#a1a1aa] overflow-hidden font-sans selection:bg-cyan-500/30">
      <Sidebar 
        isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        sessions={sessions} activeSessionId={activeSessionId}
        onNewChat={handleNewChat} onSwitchChat={setActiveSessionId}
        onDeleteChat={(id) => {
          const updated = sessions.filter(s => s.id !== id);
          setSessions(updated);
          ChatHistoryStore.deleteSession(id);
        }}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-black/60 border-b border-white/[0.06] flex items-center justify-between px-8 z-10 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-bold tracking-tight text-white">Auditros <span className="text-cyan-400">AI</span></h1>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#00e5ff]"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">Command Terminal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
               Operator: Verified Professional
             </div>
          </div>
        </header>

        <ChatInterface 
          messages={activeSession?.messages || []} documents={documents}
          onSendMessage={handleSendMessage} isProcessing={isProcessing}
          onOpenStandard={() => {}} onUpload={setDocuments} onRemoveDocument={(id) => setDocuments(prev => prev.filter(d => d.id !== id))}
        />
      </main>
    </div>
  );
};

export default App;
