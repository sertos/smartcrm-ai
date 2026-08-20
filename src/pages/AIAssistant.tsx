import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';

export default function AIAssistant() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([{role: 'ai', text: ''}]);

  useEffect(() => {
    setMessages([{ role: 'ai', text: t('ai_assistant_intro') }]);
  }, [t]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: 'user', text: input } as any];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    // Simulate AI response since we don't have direct calls in this demo file without backend setup
    setTimeout(() => {
      setMessages([...newMsgs, { role: 'ai', text: `Based on my quick analysis of "${input}", I've drafted an optimal follow-up email. You can find it in the drafts under the Negotiation stage. Is there anything else you'd like me to review?` }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] pb-4">
      <div className="mb-6 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-accent-400 flex items-center gap-3">
             <Bot size={32} className="text-brand-400" />
             {t('ai_assistant')}
           </h1>
           <p className="text-zinc-400 mt-1">{t('chat_generate_emails')}</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition">
           <RefreshCw size={16} /> {t('reset_context')}
        </button>
      </div>

      <div className="flex-1 glass-dark border border-white/5 rounded-2xl flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(139,92,246,0.1)]">
        <div className="absolute top-[-50%] left-[-10%] w-full h-[150%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
          {messages.map((m, idx) => (
             <motion.div 
               key={idx} 
               initial={{opacity:0, y:10}} 
               animate={{opacity:1, y:0}}
               className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
               <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-gradient-to-br from-accent-500 to-brand-500 text-black shadow-lg shadow-brand-500/20'}`}>
                   {m.role === 'user' ? <User size={16}/> : <Sparkles size={16}/>}
                 </div>
                 <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm' : 'glass border border-white/10 text-zinc-200 rounded-tl-sm'}`}>
                   {m.text}
                 </div>
               </div>
             </motion.div>
          ))}
          {loading && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-start">
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 text-black flex items-center justify-center">
                    <Sparkles size={16} className="animate-pulse" />
                 </div>
                 <div className="p-4 rounded-2xl glass border border-white/10 flex items-center gap-1 text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay:'0.1s'}} />
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay:'0.2s'}} />
                 </div>
               </div>
             </motion.div>
          )}
        </div>

        <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-white/5 relative z-10">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end">
            <textarea 
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder={t('ask_me_to_draft')}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-4 pr-14 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors resize-none h-14"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:hover:bg-white"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-zinc-500">
             SmartCRM AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
