import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, X, Mail, Building } from 'lucide-react';

const STAGES = ['new', 'contacted', 'negotiation', 'won', 'lost'];

export default function Pipeline() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);

  // Card AI Quick Modal
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ subject: string; body: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data: any[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setLeads(data);
    });
    return () => unsub();
  }, [user]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (!id || !user) return;
    try {
      const leadRef = doc(db, 'leads', id);
      await updateDoc(leadRef, { status, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleOpenLeadAI = async (lead: any) => {
    setActiveLead(lead);
    setGeneratedDraft(null);
    setGeneratingEmail(true);

    try {
      const res = await fetch('/api/ai/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          language: i18n.language || 'es',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.draftEmail) {
          setGeneratedDraft(data.draftEmail);
        }
      }
    } catch (e) {
      console.error('Failed to generate stage draft:', e);
      const isEs = i18n.language.startsWith('es');
      setGeneratedDraft({
        subject: isEs
          ? `Seguimiento estratégico para ${lead.company || lead.name}`
          : `Following up regarding ${lead.company || lead.name}`,
        body: isEs
          ? `Hola ${lead.name},\n\nQuería dar seguimiento a nuestra conversación reciente. Tenemos opciones personalizadas listas para ${lead.company || 'su equipo'}.\n\n¿Cuándo tendrías disponibilidad para una breve llamada?`
          : `Hi ${lead.name},\n\nI wanted to touch base regarding our recent conversation. We have customized options ready for ${lead.company}.\n\nWhen are you free for a quick chat?`,
      });
    } finally {
      setGeneratingEmail(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-white">{t('pipeline')}</h1>
            <span className="text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              {t('kanban_flow')}
            </span>
          </div>
          <p className="text-zinc-400 mt-1 text-sm">{t('drag_drop_pipeline')}</p>
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
          <Sparkles size={14} className="text-brand-400" />
          <span>{t('click_card_ai')}</span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage);
            return (
              <div
                key={stage}
                className="w-72 flex flex-col bg-zinc-900/60 rounded-2xl border border-white/10 p-3.5 backdrop-blur-sm shadow-lg"
                onDrop={(e) => handleDrop(e, stage)}
                onDragOver={handleDragOver}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1.5">
                  <h3 className="font-semibold text-sm capitalize flex items-center gap-2 text-white">
                    {stage === 'won' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />}
                    {stage === 'lost' && <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />}
                    {stage === 'new' && <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />}
                    {stage === 'contacted' && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />}
                    {stage === 'negotiation' && <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />}
                    {t(stage)}
                  </h3>
                  <span className="text-[11px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-zinc-300">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                  {stageLeads.map((lead) => (
                    <motion.div
                      layoutId={lead.id}
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, lead.id)}
                      onClick={() => handleOpenLeadAI(lead)}
                      className="bg-zinc-950/90 border border-white/10 p-3.5 rounded-xl cursor-pointer hover:border-brand-500/60 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">
                          {lead.name}
                        </p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-brand-400">
                          {lead.score || 70}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1">
                        <Building size={11} className="text-zinc-500" />
                        {lead.company || t('direct_contact')}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[11px]">
                        <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                          {lead.score > 80 ? t('high_priority') : t('active_deal')}
                        </span>
                        <span className="text-brand-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles size={11} /> {t('analyze_lead_ai')}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center border border-dashed border-white/5 rounded-xl text-zinc-600 text-xs">
                      {t('drop_here')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Quick Stage Drafter Modal */}
      <AnimatePresence>
        {activeLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-brand-500/30 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setActiveLead(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {t('stage_follow_up')}: <span className="text-brand-400 capitalize">{t(activeLead.status) || activeLead.status}</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {activeLead.name} ({activeLead.company || t('direct_contact')})
                  </p>
                </div>
              </div>

              {generatingEmail ? (
                <div className="py-12 text-center space-y-3">
                  <Sparkles size={24} className="animate-spin text-brand-400 mx-auto" />
                  <p className="text-xs text-zinc-400 font-medium">
                    {t('analyzing')}
                  </p>
                </div>
              ) : generatedDraft ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-zinc-950 rounded-2xl border border-white/10 space-y-2 text-xs">
                    <div className="text-zinc-400 font-medium pb-2 border-b border-white/5">
                      <span className="text-zinc-500 font-semibold">Subject:</span> {generatedDraft.subject}
                    </div>
                    <div className="text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto custom-scrollbar">
                      {generatedDraft.body}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
