import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Bot, Send, Sparkles, User, RefreshCw, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function AIAssistant() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; time?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [crmLeads, setCrmLeads] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        text: t('ai_assistant_intro'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [t, i18n.language]);

  useEffect(() => {
    if (!user) return;
    const fetchLeadsContext = async () => {
      try {
        const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setCrmLeads(list);
      } catch (e) {
        console.error('Error fetching leads context:', e);
      }
    };
    fetchLeadsContext();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    t('quick_prompt_1'),
    t('quick_prompt_2'),
    t('quick_prompt_3'),
    t('quick_prompt_4'),
  ];

  const handleSend = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user' as const, text: textToSend, time: timeStr };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMsgs.map((m) => ({ role: m.role, text: m.text })),
          context: {
            userEmail: user?.email,
            totalLeadsCount: crmLeads.length,
            leads: crmLeads.map((l) => ({
              name: l.name,
              company: l.company,
              status: l.status,
              score: l.score,
            })),
          },
          language: i18n.language || 'es',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: i18n.language.startsWith('es')
            ? `⚠️ No se pudo procesar la solicitud con el modelo: ${err.message || 'Error de conexión'}.`
            : `⚠️ Could not reach the AI model: ${err.message || 'Connection error'}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'ai',
        text: t('ai_assistant_intro'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-400 to-emerald-600 text-black shadow-lg shadow-brand-500/20">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {t('ai_assistant')}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  {t('ai_powered_by')}
                </span>
              </h1>
              <p className="text-zinc-400 text-xs">{t('chat_generate_emails')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>{crmLeads.length} {t('total_leads').toLowerCase()}</span>
          </div>
          <button
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition flex items-center gap-1.5"
            title={t('reset_context')}
          >
            <RefreshCw size={13} />
            <span>{t('reset_context')}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 glass-dark rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-2xl ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    m.role === 'user'
                      ? 'bg-zinc-700 text-white border border-white/10'
                      : 'bg-gradient-to-br from-brand-400 to-emerald-600 text-black font-bold'
                  }`}
                >
                  {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-zinc-800/90 text-white rounded-tr-sm border border-white/10'
                        : 'bg-zinc-900/90 border border-white/10 text-zinc-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>

                  <div className={`flex items-center gap-2 text-[11px] text-zinc-500 px-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span>{m.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-emerald-600 text-black flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-2 text-zinc-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  <span>{t('analyzing')}</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2.5 bg-zinc-950/60 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="shrink-0 text-xs bg-white/5 hover:bg-brand-500/10 hover:border-brand-500/30 text-zinc-300 hover:text-brand-300 px-3 py-1.5 rounded-full border border-white/10 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap size={11} className="text-brand-400 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-zinc-950/80 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('send_question')}
              disabled={loading}
              className="flex-1 bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white placeholder-zinc-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-brand-500 text-black font-semibold px-5 rounded-xl hover:bg-brand-400 transition-all disabled:opacity-40 disabled:hover:bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
