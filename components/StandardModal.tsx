
import React from 'react';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  standard: {
    name: string;
    text: string;
    paragraphs: string;
  } | null;
}

export const StandardModal: React.FC<StandardModalProps> = ({ isOpen, onClose, standard }) => {
  if (!isOpen || !standard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white font-jakarta">{standard.name}</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Full Technical Reference</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-all">
            <i className="fas fa-times text-gray-500"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Section Overview</h3>
            <p className="text-gray-300 leading-relaxed text-sm bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              {standard.text}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Paragraph Detail</h3>
            <div className="prose prose-invert prose-sm max-w-none">
              {standard.paragraphs.split('\n').map((p, i) => (
                <p key={i} className="text-gray-400 mb-2">{p}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
          <span className="text-[10px] text-gray-600 font-bold">SOURCE: IFRS FOUNDATION / VERIFIED BY AUDITROS AI</span>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500 transition-all">Close Reference</button>
        </div>
      </div>
    </div>
  );
};
